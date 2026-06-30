# 🏝️ System Design Definitivo — Plataforma B2B Hotelera

**Versión:** 1.0  
**Fecha:** 29 de junio de 2026  
**Stack:** Node.js 22 LTS + NestJS 10 + TypeScript 5.5 (strict) + React 19 + Next.js 15 + Tailwind 4 + PostgreSQL 16 + Redis 7 + BullMQ 5  
**Mercado inicial:** Golfo de Morrosquillo (Tolú, Coveñas, San Antero) y Sucre, Colombia  
**Documento fuente de verdad única — todo desarrollo se rige por este documento.**

---

## Índice

1. [Data Model Completo (Prisma Schema)](#1-data-model-completo-prisma-schema)
2. [NestJS Module Architecture](#2-nestjs-module-architecture)
3. [RLS Policies Detalladas](#3-rls-policies-detalladas)
4. [Optimistic Locking Strategy](#4-optimistic-locking-strategy)
5. [Offline Sync Architecture](#5-offline-sync-architecture)
6. [BullMQ Queue Design](#6-bullmq-queue-design)
7. [OpenWA Integration Detail](#7-openwa-integration-detail)
8. [Error Handling Strategy](#8-error-handling-strategy)
9. [Security Deep Dive](#9-security-deep-dive)
10. [Testing Strategy](#10-testing-strategy)
11. [API Contract (OpenAPI 3.0)](#11-api-contract-openapi-30)
12. [Feature Flags (Plan Tiers)](#12-feature-flags-plan-tiers)

---


## 1. Data Model Completo (Prisma Schema)

### 1.1 Enums

```prisma
enum BookingStatus { PENDING CONFIRMED CANCELLED MODIFIED NO_SHOW CHECKED_IN CHECKED_OUT }
enum ChannelType { DIRECT BOOKING_COM EXPEDIA DESPEGAR AIRBNB PRICE_TRAVEL OTHER }
enum PlanType { FREE FOUNDERS MICRO STARTER GROWTH PRO ENTERPRISE }
enum UserRole { ADMIN STAFF SUPER_ADMIN }
enum RoomStatus { AVAILABLE OCCUPIED MAINTENANCE OUT_OF_ORDER }
enum SeasonType { HIGH MEDIUM LOW }
enum RatePlanType { BAR DERIVED PROMOTIONAL CHANNEL_SPECIFIC }
enum PromotionType { DISCOUNT_PERCENTAGE FIXED_AMOUNT FREE_NIGHTS EARLY_BIRD LAST_MINUTE PACKAGE NON_REFUNDABLE LOYALTY }
enum RefundStatus { PENDING COMPLETED FAILED }
enum TicketStatus { OPEN IN_PROGRESS WAITING_HOTEL RESOLVED CLOSED }
enum TicketPriority { LOW MEDIUM HIGH URGENT }
enum AuditAction { CREATED UPDATED DELETED LOGIN LOGOUT PLAN_CHANGED PAYMENT_RECEIVED }
```

### 1.2 Prisma Schema

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["rowLevelSecurity"]
}
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// === HOTEL & TENANT ===
model Hotel {
  id            String   @id @default(uuid()) @db.Uuid
  name          String   @db.VarChar(200)
  slug          String   @db.VarChar(100)
  timezone      String   @default("America/Bogota") @db.VarChar(50)
  currency      String   @default("COP") @db.VarChar(3)
  address       String?  @db.Text
  phone         String?  @db.VarChar(50)
  email         String?  @db.VarChar(200)
  logo          String?  @db.VarChar(500)
  checkinTime   String   @default("15:00") @map("checkin_time") @db.VarChar(5)
  checkoutTime  String   @default("12:00") @map("checkout_time") @db.VarChar(5)
  plan          PlanType @default(FREE)
  isFounder     Boolean  @default(false) @map("is_founder")
  isActive      Boolean  @default(true) @map("is_active")
  founderExpiresAt DateTime? @map("founder_expires_at") @db.Timestamptz()
  createdAt     DateTime @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt     DateTime @updatedAt @map("updated_at") @db.Timestamptz()
  users         User[]; roomTypes RoomType[]; ratePlans RatePlan[]; seasons Season[]
  bookings      Booking[]; promotions Promotion[]; channelConnections ChannelConnection[]
  auditLogs     AuditLog[]; supportTickets SupportTicket[]
  @@unique([slug]); @@map("hotels")
}

model User {
  id           String    @id @default(uuid()) @db.Uuid
  hotelId      String    @map("hotel_id") @db.Uuid
  email        String    @db.VarChar(255)
  passwordHash String    @map("password_hash") @db.VarChar(255)
  name         String    @db.VarChar(200)
  phone        String?   @db.VarChar(50)
  role         UserRole  @default(ADMIN)
  isActive     Boolean   @default(true) @map("is_active")
  lastLoginAt  DateTime? @map("last_login_at") @db.Timestamptz()
  createdAt    DateTime  @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt    DateTime  @updatedAt @map("updated_at") @db.Timestamptz()
  hotel Hotel @relation(fields: [hotelId], references: [id], onDelete: Cascade)
  @@unique([email]); @@index([hotelId]); @@map("users")
}

// === ROOM TYPES & ROOMS ===
model RoomType {
  id             String   @id @default(uuid()) @db.Uuid
  hotelId        String   @map("hotel_id") @db.Uuid
  name           String   @db.VarChar(200)
  description    String?  @db.Text
  baseOccupancy  Int      @default(2) @map("base_occupancy")
  maxOccupancy   Int      @default(4) @map("max_occupancy")
  sizeSqm        Decimal? @map("size_sqm") @db.Decimal(6,2)
  bedType        String?  @map("bed_type") @db.VarChar(50)
  amenities      Json?    @default("[]") @db.JsonB
  images         Json?    @default("[]") @db.JsonB
  isActive       Boolean  @default(true) @map("is_active")
  sortOrder      Int      @default(0) @map("sort_order")
  createdAt      DateTime @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt      DateTime @updatedAt @map("updated_at") @db.Timestamptz()
  hotel Hotel @relation(fields: [hotelId], references: [id], onDelete: Cascade)
  rooms Room[]; inventories Inventory[]; rates Rate[]; bookingRooms BookingRoom[]
  @@unique([hotelId, name]); @@index([hotelId]); @@map("room_types")
}

model Room {
  id         String     @id @default(uuid()) @db.Uuid
  roomTypeId String     @map("room_type_id") @db.Uuid
  roomNumber String     @map("room_number") @db.VarChar(20)
  floor      String?    @db.VarChar(10)
  status     RoomStatus @default(AVAILABLE)
  isActive   Boolean    @default(true) @map("is_active")
  createdAt  DateTime   @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt  DateTime   @updatedAt @map("updated_at") @db.Timestamptz()
  roomType RoomType @relation(fields: [roomTypeId], references: [id], onDelete: Cascade)
  @@unique([roomTypeId, roomNumber]); @@index([roomTypeId]); @@map("rooms")
}

// === INVENTORY (core — optimistic locking) ===
model Inventory {
  hotelId        String   @map("hotel_id") @db.Uuid
  roomTypeId     String   @map("room_type_id") @db.Uuid
  date           DateTime @db.Date
  totalRooms     Int      @default(0) @map("total_rooms")
  availableRooms Int      @default(0) @map("available_rooms")
  bookedRooms    Int      @default(0) @map("booked_rooms")
  oversellLimit  Int      @default(0) @map("oversell_limit")
  version        Int      @default(1)
  updatedAt      DateTime @updatedAt @map("updated_at") @db.Timestamptz()
  roomType RoomType @relation(fields: [roomTypeId], references: [id])
  @@unique([hotelId, roomTypeId, date])
  @@index([hotelId, date]); @@index([roomTypeId, date]); @@map("inventory")
}

model Restriction {
  hotelId    String   @map("hotel_id") @db.Uuid
  roomTypeId String   @map("room_type_id") @db.Uuid
  date       DateTime @db.Date
  minLos     Int      @default(1) @map("min_los")
  maxLos     Int?     @map("max_los")
  cta        Boolean  @default(false)
  ctd        Boolean  @default(false)
  stopSell   Boolean  @default(false) @map("stop_sell")
  version    Int      @default(1)
  updatedAt  DateTime @updatedAt @map("updated_at") @db.Timestamptz()
  @@unique([hotelId, roomTypeId, date]); @@index([hotelId, date]); @@map("restrictions")
}

// === PRICING ===
model RatePlan {
  id               String       @id @default(uuid()) @db.Uuid
  hotelId          String       @map("hotel_id") @db.Uuid
  name             String       @db.VarChar(200)
  type             RatePlanType @default(BAR)
  baseRatePlanId   String?      @map("base_rate_plan_id") @db.Uuid
  currency         String       @default("COP") @db.VarChar(3)
  floorPrice       Decimal?     @map("floor_price") @db.Decimal(12,2)
  markupPercentage Decimal?     @map("markup_percentage") @db.Decimal(5,2)
  isActive         Boolean      @default(true) @map("is_active")
  createdAt        DateTime     @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt        DateTime     @updatedAt @map("updated_at") @db.Timestamptz()
  hotel Hotel @relation(fields: [hotelId], references: [id], onDelete: Cascade)
  basePlan RatePlan? @relation("RatePlanDerivatives", fields: [baseRatePlanId], references: [id])
  derivedPlans RatePlan[] @relation("RatePlanDerivatives")
  rates Rate[]
  @@index([hotelId]); @@map("rate_plans")
}

model Rate {
  hotelId    String   @map("hotel_id") @db.Uuid
  roomTypeId String   @map("room_type_id") @db.Uuid
  ratePlanId String   @map("rate_plan_id") @db.Uuid
  date       DateTime @db.Date
  amount     Decimal  @db.Decimal(12,2)
  currency   String   @default("COP") @db.VarChar(3)
  version    Int      @default(1)
  updatedAt  DateTime @updatedAt @map("updated_at") @db.Timestamptz()
  roomType RoomType @relation(fields: [roomTypeId], references: [id])
  ratePlan RatePlan @relation(fields: [ratePlanId], references: [id])
  @@unique([hotelId, roomTypeId, ratePlanId, date])
  @@index([hotelId, date]); @@index([ratePlanId, date]); @@map("rates")
}

model Season {
  id        String     @id @default(uuid()) @db.Uuid
  hotelId   String     @map("hotel_id") @db.Uuid
  name      String     @db.VarChar(200)
  type      SeasonType
  startDate DateTime   @map("start_date") @db.Date
  endDate   DateTime   @map("end_date") @db.Date
  multiplier Decimal?  @default(1.0) @db.Decimal(4,2)
  colorHex  String?    @map("color_hex") @db.VarChar(7)
  isActive  Boolean    @default(true) @map("is_active")
  createdAt DateTime   @default(now()) @map("created_at") @db.Timestamptz()
  hotel Hotel @relation(fields: [hotelId], references: [id], onDelete: Cascade)
  @@index([hotelId]); @@map("seasons")
}

// === BOOKINGS ===
model Booking {
  id              String        @id @default(uuid()) @db.Uuid
  hotelId         String        @map("hotel_id") @db.Uuid
  channel         ChannelType
  channelBookingId String?      @map("channel_booking_id") @db.VarChar(200)
  guestName       String        @map("guest_name") @db.VarChar(200)
  guestEmail      String?       @map("guest_email") @db.VarChar(255)
  guestPhone      String?       @map("guest_phone") @db.VarChar(50)
  checkinDate     DateTime      @map("checkin_date") @db.Date
  checkoutDate    DateTime      @map("checkout_date") @db.Date
  totalAmount     Decimal       @map("total_amount") @db.Decimal(12,2)
  currency        String        @default("COP") @db.VarChar(3)
  status          BookingStatus @default(PENDING)
  idempotencyKey  String?       @map("idempotency_key") @db.VarChar(255)
  metadata        Json?         @default("{}") @db.JsonB
  cancellationId  String?       @map("cancellation_id") @db.Uuid
  createdAt       DateTime      @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt       DateTime      @updatedAt @map("updated_at") @db.Timestamptz()
  hotel Hotel @relation(fields: [hotelId], references: [id], onDelete: Cascade)
  rooms BookingRoom[]; cancellation Cancellation? @relation(fields: [cancellationId], references: [id])
  @@unique([idempotencyKey])
  @@index([hotelId, status]); @@index([hotelId, checkinDate]); @@index([channel, channelBookingId])
  @@map("bookings")
}

model BookingRoom {
  id          String   @id @default(uuid()) @db.Uuid
  bookingId   String   @map("booking_id") @db.Uuid
  roomTypeId  String   @map("room_type_id") @db.Uuid
  ratePlanId  String   @map("rate_plan_id") @db.Uuid
  date        DateTime @db.Date
  amount      Decimal  @db.Decimal(12,2)
  roomId      String?  @map("room_id") @db.Uuid
  booking Booking @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  roomType RoomType @relation(fields: [roomTypeId], references: [id])
  @@index([bookingId]); @@index([roomTypeId, date]); @@map("booking_rooms")
}

model Cancellation {
  id              String       @id @default(uuid()) @db.Uuid
  bookingId       String       @map("booking_id") @db.Uuid
  cancelledAt     DateTime     @default(now()) @map("cancelled_at") @db.Timestamptz()
  reason          String?      @db.Text
  cancellationFee Decimal      @default(0) @map("cancellation_fee") @db.Decimal(12,2)
  refundAmount    Decimal      @default(0) @map("refund_amount") @db.Decimal(12,2)
  refundStatus    RefundStatus @default(PENDING) @map("refund_status")
  bookings Booking[]
  @@index([bookingId]); @@map("cancellations")
}

// === CHANNEL CONNECTIONS ===
model ChannelConnection {
  id               String   @id @default(uuid()) @db.Uuid
  hotelId          String   @map("hotel_id") @db.Uuid
  channel          ChannelType
  apiKeyEncrypted  String?  @map("api_key_encrypted") @db.Text
  apiSecretEncrypted String? @map("api_secret_encrypted") @db.Text
  credentialsIv    String?  @map("credentials_iv") @db.VarChar(64)
  isActive         Boolean  @default(true) @map("is_active")
  lastSyncAt       DateTime? @map("last_sync_at") @db.Timestamptz()
  syncStatus       String   @default("pending") @map("sync_status") @db.VarChar(20)
  createdAt        DateTime @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt        DateTime @updatedAt @map("updated_at") @db.Timestamptz()
  hotel Hotel @relation(fields: [hotelId], references: [id], onDelete: Cascade)
  @@unique([hotelId, channel]); @@index([hotelId]); @@map("channel_connections")
}

model ChannelReservation {
  id              String   @id @default(uuid()) @db.Uuid
  channel         ChannelType
  channelBookingId String  @map("channel_booking_id") @db.VarChar(200)
  hotelId         String   @map("hotel_id") @db.Uuid
  bookingId       String?  @map("booking_id") @db.Uuid
  rawData         Json?    @map("raw_data") @db.JsonB
  syncStatus      String   @default("pending") @map("sync_status") @db.VarChar(20)
  syncAttempts    Int      @default(0) @map("sync_attempts")
  lastError       String?  @map("last_error") @db.Text
  createdAt       DateTime @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt       DateTime @updatedAt @map("updated_at") @db.Timestamptz()
  @@unique([channel, channelBookingId])
  @@index([hotelId, syncStatus]); @@map("channel_reservations")
}

// === PROMOTIONS ===
model Promotion {
  id               String         @id @default(uuid()) @db.Uuid
  hotelId          String         @map("hotel_id") @db.Uuid
  name             String         @db.VarChar(200)
  description      String?        @db.Text
  type             PromotionType
  discountType     String         @map("discount_type") @db.VarChar(20)
  discountValue    Decimal        @map("discount_value") @db.Decimal(12,2)
  stackable        Boolean        @default(false)
  minMarginPercent Decimal?       @map("min_margin_percent") @db.Decimal(5,2)
  startDate        DateTime       @map("start_date") @db.Date
  endDate          DateTime       @map("end_date") @db.Date
  applicableRoomTypeIds Json?     @default("[]") @map("applicable_room_type_ids") @db.JsonB
  conditions       Json?          @default("{}") @db.JsonB
  isActive         Boolean        @default(true) @map("is_active")
  createdAt        DateTime       @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt        DateTime       @updatedAt @map("updated_at") @db.Timestamptz()
  hotel Hotel @relation(fields: [hotelId], references: [id], onDelete: Cascade)
  @@index([hotelId]); @@map("promotions")
}

// === SUBSCRIPTIONS & BILLING ===
model Subscription {
  id             String    @id @default(uuid()) @db.Uuid
  hotelId        String    @map("hotel_id") @db.Uuid
  plan           PlanType
  status         String    @default("active") @db.VarChar(20)
  currentPeriodStart DateTime @map("current_period_start") @db.Timestamptz()
  currentPeriodEnd   DateTime @map("current_period_end") @db.Timestamptz()
  paymentProviderId String? @map("payment_provider_id") @db.VarChar(200)
  cancelAtPeriodEnd Boolean @default(false) @map("cancel_at_period_end")
  trialEndsAt       DateTime? @map("trial_ends_at") @db.Timestamptz()
  createdAt         DateTime @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt         DateTime @updatedAt @map("updated_at") @db.Timestamptz()
  @@index([hotelId]); @@map("subscriptions")
}

model PaymentMethod {
  id               String   @id @default(uuid()) @db.Uuid
  hotelId          String   @map("hotel_id") @db.Uuid
  type             String   @db.VarChar(20)
  providerId       String   @map("provider_id") @db.VarChar(200)
  lastFour         String?  @map("last_four") @db.VarChar(4)
  isDefault        Boolean  @default(false) @map("is_default")
  isActive         Boolean  @default(true) @map("is_active")
  createdAt        DateTime @default(now()) @map("created_at") @db.Timestamptz()
  @@index([hotelId]); @@map("payment_methods")
}

model Invoice {
  id            String   @id @default(uuid()) @db.Uuid
  hotelId       String   @map("hotel_id") @db.Uuid
  subscriptionId String? @map("subscription_id") @db.Uuid
  amount        Decimal  @db.Decimal(12,2)
  currency      String   @default("COP") @db.VarChar(3)
  status        String   @default("pending") @db.VarChar(20)
  dianXml       String?  @map("dian_xml") @db.Text
  dianCufe      String?  @map("dian_cufe") @db.VarChar(200)
  periodStart   DateTime @map("period_start") @db.Date
  periodEnd     DateTime @map("period_end") @db.Date
  paidAt        DateTime? @map("paid_at") @db.Timestamptz()
  createdAt     DateTime @default(now()) @map("created_at") @db.Timestamptz()
  @@index([hotelId, status]); @@map("invoices")
}

// === WHATSAPP ===
model WhatsAppSession {
  id          String   @id @default(uuid()) @db.Uuid
  hotelId     String   @map("hotel_id") @db.Uuid
  sessionId   String   @map("session_id") @db.VarChar(100)
  phoneNumber String?  @map("phone_number") @db.VarChar(20)
  status      String   @default("disconnected") @db.VarChar(20)
  qrCode      String?  @map("qr_code") @db.Text
  qrExpiresAt DateTime? @map("qr_expires_at") @db.Timestamptz()
  createdAt   DateTime @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt   DateTime @updatedAt @map("updated_at") @db.Timestamptz()
  @@unique([hotelId]); @@index([sessionId]); @@map("whatsapp_sessions")
}

model WhatsAppMessage {
  id         String   @id @default(uuid()) @db.Uuid
  hotelId    String   @map("hotel_id") @db.Uuid
  sessionId  String   @map("session_id") @db.VarChar(100)
  direction  String   @db.VarChar(10)
  messageType String  @map("message_type") @db.VarChar(30)
  content    Json?    @db.JsonB
  status     String   @default("pending") @db.VarChar(20)
  metadata   Json?    @default("{}") @db.JsonB
  createdAt  DateTime @default(now()) @map("created_at") @db.Timestamptz()
  @@index([hotelId, createdAt]); @@index([sessionId, status]); @@map("whatsapp_messages")
}

// === SUPPORT TICKETS ===
model SupportTicket {
  id              String       @id @default(uuid()) @db.Uuid
  hotelId         String       @map("hotel_id") @db.Uuid
  subject         String       @db.VarChar(200)
  description     String?      @db.Text
  category        String       @default("technical") @db.VarChar(30)
  priority        TicketPriority @default(MEDIUM)
  status          TicketStatus @default(OPEN)
  assignedTo      String?      @map("assigned_to") @db.Uuid
  whatsappMessageId String?    @map("whatsapp_message_id") @db.VarChar(100)
  closedAt        DateTime?    @map("closed_at") @db.Timestamptz()
  createdAt       DateTime     @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt       DateTime     @updatedAt @map("updated_at") @db.Timestamptz()
  hotel Hotel @relation(fields: [hotelId], references: [id], onDelete: Cascade)
  messages TicketMessage[]
  @@index([hotelId, status]); @@index([status, priority]); @@map("support_tickets")
}

model TicketMessage {
  id         String   @id @default(uuid()) @db.Uuid
  ticketId   String   @map("ticket_id") @db.Uuid
  sender     String   @db.VarChar(20)
  message    String   @db.Text
  channel    String   @default("whatsapp") @db.VarChar(20)
  createdAt  DateTime @default(now()) @map("created_at") @db.Timestamptz()
  ticket SupportTicket @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  @@index([ticketId]); @@map("ticket_messages")
}

// === AUDIT LOG ===
model AuditLog {
  id            String      @id @default(uuid()) @db.Uuid
  correlationId String      @map("correlation_id") @db.Uuid
  hotelId       String      @map("hotel_id") @db.Uuid
  userId        String?     @map("user_id") @db.Uuid
  action        AuditAction
  resource      String      @db.VarChar(100)
  resourceId    String?     @map("resource_id") @db.VarChar(100)
  oldValue      Json?       @map("old_value") @db.JsonB
  newValue      Json?       @map("new_value") @db.JsonB
  metadata      Json?       @default("{}") @db.JsonB
  ip            String?     @db.Inet
  userAgent     String?     @map("user_agent") @db.Text
  createdAt     DateTime    @default(now()) @map("created_at") @db.Timestamptz()
  @@index([hotelId, createdAt]); @@index([correlationId])
  @@index([resource, resourceId]); @@index([createdAt]); @@map("audit_logs")
}

model JobLog {
  id        String   @id @default(uuid()) @db.Uuid
  queueName String   @map("queue_name") @db.VarChar(50)
  jobId     String   @map("job_id") @db.VarChar(50)
  jobName   String   @map("job_name") @db.VarChar(100)
  data      Json?    @db.JsonB
  status    String   @db.VarChar(20)
  error     String?  @db.Text
  attempts  Int      @default(0)
  duration  Int?     @map("duration")
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz()
  @@index([queueName, createdAt]); @@index([status]); @@map("job_logs")
}
```

### 1.3 Índices Compuestos Clave

| Tabla | Índice | Propósito |
|---|---|---|
| `inventory` | `(hotel_id, date)` | Range scan por hotel + fechas |
| `inventory` | `(room_type_id, date)` | Búsqueda rápida por tipo de habitación |
| `rates` | `(hotel_id, date)` | Range scan rates por hotel |
| `rates` | `(rate_plan_id, date)` | Rates por plan de tarifa |
| `bookings` | `(hotel_id, checkin_date)` | Próximas llegadas por hotel |
| `bookings` | `(channel, channel_booking_id)` | Búsqueda de reserva OTA |
| `bookings` | `(idempotency_key)` | UNIQUE — prevención de duplicados |
| `audit_logs` | `(hotel_id, created_at)` | Consulta de auditoría por hotel |
| `audit_logs` | `(created_at)` | TTL cleanup por fecha |


## 2. NestJS Module Architecture

### 2.1 Estructura de Módulos

```
apps/api/src/
├── main.ts / app.module.ts
├── auth/                       # Autenticación + autorización
│   ├── auth.module.ts / auth.controller.ts / auth.service.ts
│   ├── auth.guard.ts (JwtAuthGuard)
│   ├── roles.guard.ts (RolesGuard)
│   ├── plan.guard.ts (PlanGuard — feature flags por plan)
│   ├── strategies/jwt.strategy.ts
│   └── dto/ (register.dto.ts, login.dto.ts, forgot-password.dto.ts, reset-password.dto.ts)
│
├── hotels/                     # Gestión de hoteles (tenant)
│   ├── hotels.module.ts / hotels.controller.ts / hotels.service.ts
│   └── dto/ (create-hotel.dto.ts, update-hotel.dto.ts, update-plan.dto.ts)
│
├── room-types/                 # Tipos de habitación
│   ├── room-types.module.ts / controller.ts / service.ts / dto/
│
├── inventory/                  # Inventario pooled (core)
│   ├── inventory.module.ts / inventory.controller.ts / inventory.service.ts
│   ├── availability.service.ts / cache.service.ts / lock.service.ts
│   └── dto/ (update-inventory.dto.ts, bulk-update.dto.ts)
│
├── rates/                      # Rate plans + tarifas
│   ├── rates.module.ts / rates.controller.ts / rates.service.ts
│   ├── rate-plans.service.ts / seasons.service.ts / dto/
│
├── bookings/                   # Reservas
│   ├── bookings.module.ts / bookings.controller.ts / bookings.service.ts
│   ├── cancellations.service.ts / dto/ (create-booking.dto.ts, cancel-booking.dto.ts)
│
├── channels/                   # Conectores OTA
│   ├── channels.module.ts
│   ├── connectors/
│   │   ├── ota-connector.interface.ts
│   │   ├── booking/ (booking.connector.ts, booking.parser.ts, booking.webhook.controller.ts)
│   │   ├── despegar/ (despegar.connector.ts, despegar.adapter.ts, despegar.webhook.controller.ts)
│   │   └── expedia/ (Fase 2+)
│   ├── reconciliation.service.ts / dto/
│
├── whatsapp/                   # WhatsApp / OpenWA
│   ├── whatsapp.module.ts / whatsapp.controller.ts / whatsapp.service.ts
│   ├── session.service.ts / webhook.controller.ts
│   ├── adapters/
│   │   ├── whatsapp-adapter.interface.ts
│   │   ├── openwa.provider.ts
│   │   └── business-api.provider.ts (FUT-01)
│   └── dto/ (send-message.dto.ts, webhook-payload.dto.ts)
│
├── promotions/                 # Motor de promociones
│   ├── promotions.module.ts / controller.ts / service.ts
│   ├── stacking.validator.ts / dto/
│
├── notifications/              # Notificaciones multi-canal
│   ├── notifications.module.ts / notifications.service.ts
│   ├── notification.gateway.ts (WebSocket)
│   └── templates/ (booking-confirmation.ts, password-reset.ts, weekly-report.ts)
│
├── dashboard/                  # Dashboard hotelero
│   ├── dashboard.module.ts / controller.ts / service.ts / dto/
│
├── analytics/                  # Métricas y reportes
│   ├── analytics.module.ts / controller.ts / service.ts / dto/
│
├── billing/                    # Facturación DIAN + pagos
│   ├── billing.module.ts / controller.ts / service.ts
│   ├── dian/ (dian.service.ts, dian.provider.interface.ts) / dto/
│
├── admin/                      # Admin panel (super_admin)
│   ├── admin.module.ts / controller.ts / service.ts / dto/
│
├── support/                    # Tickets de soporte
│   ├── support.module.ts / controller.ts / service.ts / dto/
│
├── audit/                      # Auditoría
│   ├── audit.module.ts / audit.service.ts / audit.interceptor.ts / dto/
│
├── mail/                       # Email transaccional
│   ├── mail.module.ts / mail.service.ts / mail.processor.ts / templates/
│
├── queues/                     # BullMQ configuración
│   ├── queues.module.ts / queues.service.ts / queue.constants.ts
│   └── processors/ (ota-sync, reconciliation, whatsapp, email, backup)
│
├── common/                     # Shared utilities
│   ├── common.module.ts
│   ├── guards/ (jwt-auth.guard.ts, roles.guard.ts, plan.guard.ts)
│   ├── interceptors/ (logging.interceptor.ts, audit.interceptor.ts, version.interceptor.ts, timeout.interceptor.ts)
│   ├── filters/ (http-exception.filter.ts)
│   ├── pipes/ (validation.pipe.ts)
│   ├── middleware/ (tenant-context.middleware.ts, correlation-id.middleware.ts)
│   ├── decorators/ (current-user.decorator.ts, roles.decorator.ts, plan.decorator.ts)
│   ├── constants/ (plans.ts)
│   ├── interfaces/ (module-service.interface.ts, pagination.interface.ts)
│   └── utils/ (encryption.util.ts, retry.util.ts, circuit-breaker.ts)
│
└── prisma/ (schema.prisma, seed.ts, migrations/)
```

### 2.2 Interfaz de Servicio por Módulo (Contrato)

Cada módulo expone su contrato público vía interfaces TypeScript para facilitar la migración a microservicios (Fase 3+):

```typescript
// inventory/interfaces/availability-service.interface.ts
export interface IAvailabilityService extends IModuleService {
  getAvailability(hotelId: string, roomTypeId: string, date: Date): Promise<AvailabilityDto>;
  getBulkAvailability(hotelId: string, from: Date, to: Date): Promise<BulkAvailabilityDto>;
  updateInventory(hotelId: string, roomTypeId: string, date: Date, delta: number, version: number, correlationId: string): Promise<InventoryResultDto>;
  validateAvailability(hotelId: string, roomTypeId: string, checkin: Date, checkout: Date, quantity: number): Promise<AvailabilityValidationDto>;
}

// bookings/interfaces/booking-service.interface.ts
export interface IBookingService extends IModuleService {
  createBooking(dto: CreateBookingDto): Promise<BookingDto>;
  confirmBooking(id: string): Promise<BookingDto>;
  cancelBooking(id: string, reason?: string): Promise<BookingDto>;
  getBooking(id: string): Promise<BookingDto>;
  findByChannelBookingId(channel: ChannelType, channelBookingId: string): Promise<BookingDto | null>;
}

// channels/interfaces/ota-connector.interface.ts
export interface OTAConnector {
  readonly channel: ChannelType;
  pushAvailability(hotelId: string, availability: OTAInventoryDto[]): Promise<OTAResult>;
  pushRates(hotelId: string, rates: OTARateDto[]): Promise<OTAResult>;
  pullBookings(hotelId: string, from: Date, to: Date): Promise<OTABookingDto[]>;
  validateConnection(credentials: OTAConnectionDto): Promise<boolean>;
}

// whatsapp/adapters/whatsapp-adapter.interface.ts
export interface WhatsAppAdapter {
  readonly provider: string;
  sendText(to: string, message: string): Promise<MessageResult>;
  sendTemplate(to: string, template: TemplateMessage): Promise<MessageResult>;
  sendImage(to: string, imageUrl: string, caption?: string): Promise<MessageResult>;
  createSession(hotelId: string): Promise<SessionResult>;
  getQRCode(sessionId: string): Promise<string>;
  getSessionStatus(sessionId: string): Promise<SessionStatus>;
  disconnectSession(sessionId: string): Promise<void>;
}
```

### 2.3 Guards

```typescript
// common/guards/jwt-auth.guard.ts
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info, context) {
    if (err || !user) {
      throw err || new UnauthorizedException({
        statusCode: 401, error: 'UNAUTHORIZED',
        message: 'Token de autenticación inválido o expirado',
        code: 'AUTH_TOKEN_INVALID',
      });
    }
    return user;
  }
}

// common/guards/plan.guard.ts — Feature flags por plan
@Injectable()
export class PlanGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredFeatures = this.reflector.getAllAndOverride<string[]>('plan', [context.getHandler(), context.getClass()]);
    if (!requiredFeatures) return true;
    const { user } = context.switchToHttp().getRequest();
    const hotel = await this.prisma.hotel.findUnique({ where: { id: user.hotelId }, select: { plan: true, isFounder: true } });
    if (hotel.isFounder) return true; // Founders bypass

    for (const feature of requiredFeatures) {
      if (!PLAN_FEATURES[hotel.plan]?.[feature]) {
        throw new ForbiddenException({
          statusCode: 403, error: 'PLAN_LIMIT_EXCEEDED',
          message: `Tu plan ${hotel.plan} no incluye esta funcionalidad. Actualiza tu plan.`,
          code: 'PLAN_FEATURE_BLOCKED',
        });
      }
    }
    return true;
  }
}

// common/interceptors/logging.interceptor.ts
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const correlationId = request.correlationId;
    const now = Date.now();
    return next.handle().pipe(tap({
      next: () => void this.logger.log({ correlationId, method, url, statusCode: context.switchToHttp().getResponse().statusCode, duration: Date.now() - now }),
      error: (error) => void this.logger.error({ correlationId, method, url, error: error.message, duration: Date.now() - now }),
    }));
  }
}
```


## 3. RLS Policies Detalladas

### 3.1 Función de Contexto

```sql
CREATE OR REPLACE FUNCTION app.set_tenant_context(hotel_id UUID)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.current_tenant_id', hotel_id::TEXT, true);
  PERFORM set_config('app.current_user_id', current_setting('app.current_user_id'), true);
  PERFORM set_config('app.current_user_role', current_setting('app.current_user_role'), true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION app.current_tenant_id()
RETURNS UUID AS $$
BEGIN
  RETURN current_setting('app.current_tenant_id')::UUID;
EXCEPTION WHEN OTHERS THEN RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION app.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN current_setting('app.current_user_role') = 'SUPER_ADMIN';
END;
$$ LANGUAGE plpgsql STABLE;
```

### 3.2 Políticas RLS por Tabla

```sql
-- Enable RLS en todas las tablas multi-tenant
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE restrictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Política genérica de aislamiento por tenant + bypass para super_admin
CREATE POLICY hotel_tenant_isolation ON hotels FOR ALL
  USING (id = app.current_tenant_id() OR app.is_super_admin())
  WITH CHECK (id = app.current_tenant_id() OR app.is_super_admin());

CREATE POLICY user_tenant_isolation ON users FOR ALL
  USING (hotel_id = app.current_tenant_id() OR app.is_super_admin())
  WITH CHECK (hotel_id = app.current_tenant_id() OR app.is_super_admin());

CREATE POLICY room_type_tenant_isolation ON room_types FOR ALL
  USING (hotel_id = app.current_tenant_id() OR app.is_super_admin())
  WITH CHECK (hotel_id = app.current_tenant_id() OR app.is_super_admin());

CREATE POLICY room_tenant_isolation ON rooms FOR ALL
  USING (EXISTS (SELECT 1 FROM room_types rt WHERE rt.id = rooms.room_type_id AND rt.hotel_id = app.current_tenant_id()) OR app.is_super_admin());

CREATE POLICY inventory_tenant_isolation ON inventory FOR ALL
  USING (hotel_id = app.current_tenant_id() OR app.is_super_admin())
  WITH CHECK (hotel_id = app.current_tenant_id() OR app.is_super_admin());

CREATE POLICY restriction_tenant_isolation ON restrictions FOR ALL
  USING (hotel_id = app.current_tenant_id() OR app.is_super_admin())
  WITH CHECK (hotel_id = app.current_tenant_id() OR app.is_super_admin());

CREATE POLICY rate_plan_tenant_isolation ON rate_plans FOR ALL
  USING (hotel_id = app.current_tenant_id() OR app.is_super_admin())
  WITH CHECK (hotel_id = app.current_tenant_id() OR app.is_super_admin());

CREATE POLICY rate_tenant_isolation ON rates FOR ALL
  USING (hotel_id = app.current_tenant_id() OR app.is_super_admin())
  WITH CHECK (hotel_id = app.current_tenant_id() OR app.is_super_admin());

CREATE POLICY season_tenant_isolation ON seasons FOR ALL
  USING (hotel_id = app.current_tenant_id() OR app.is_super_admin())
  WITH CHECK (hotel_id = app.current_tenant_id() OR app.is_super_admin());

CREATE POLICY booking_tenant_isolation ON bookings FOR ALL
  USING (hotel_id = app.current_tenant_id() OR app.is_super_admin())
  WITH CHECK (hotel_id = app.current_tenant_id() OR app.is_super_admin());

CREATE POLICY booking_room_tenant_isolation ON booking_rooms FOR ALL
  USING (EXISTS (SELECT 1 FROM bookings b WHERE b.id = booking_rooms.booking_id AND b.hotel_id = app.current_tenant_id()) OR app.is_super_admin());

CREATE POLICY promotion_tenant_isolation ON promotions FOR ALL
  USING (hotel_id = app.current_tenant_id() OR app.is_super_admin())
  WITH CHECK (hotel_id = app.current_tenant_id() OR app.is_super_admin());

CREATE POLICY channel_connection_tenant_isolation ON channel_connections FOR ALL
  USING (hotel_id = app.current_tenant_id() OR app.is_super_admin())
  WITH CHECK (hotel_id = app.current_tenant_id() OR app.is_super_admin());

CREATE POLICY invoice_tenant_isolation ON invoices FOR ALL
  USING (hotel_id = app.current_tenant_id() OR app.is_super_admin())
  WITH CHECK (hotel_id = app.current_tenant_id() OR app.is_super_admin());

CREATE POLICY whatsapp_session_tenant_isolation ON whatsapp_sessions FOR ALL
  USING (hotel_id = app.current_tenant_id() OR app.is_super_admin())
  WITH CHECK (hotel_id = app.current_tenant_id() OR app.is_super_admin());

CREATE POLICY support_ticket_tenant_isolation ON support_tickets FOR ALL
  USING (hotel_id = app.current_tenant_id() OR app.is_super_admin())
  WITH CHECK (hotel_id = app.current_tenant_id() OR app.is_super_admin());
```

### 3.3 Middleware de Integración

```typescript
// common/middleware/tenant-context.middleware.ts
@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const user = req.user as JwtPayload;
    if (user) {
      await this.prisma.$executeRawUnsafe(`SELECT app.set_tenant_context($1)`, user.hotelId);
      await this.prisma.$executeRawUnsafe(`SELECT set_config('app.current_user_id', $1, true)`, user.sub);
      await this.prisma.$executeRawUnsafe(`SELECT set_config('app.current_user_role', $1, true)`, user.role);
    }
    next();
  }
}
```


## 4. Optimistic Locking Strategy

### 4.1 Estrategia General

**Elección:** **First-write-wins** con retry. Es la estrategia correcta para el dominio hotelero donde el overbooking es inaceptable.

| Escenario | Estrategia | Justificación |
|---|---|---|
| **Reserva (booking)** | First-write-wins + retry | Overbooking = inaceptable |
| **Actualización manual inventario** | Last-write-wins (sin version check) | El hotelero siempre tiene la razón |
| **Sync OTA entrante** | First-write-wins + DLQ | Datos de fuente externa deben validarse |
| **Offline sync** | Last-write-wins con timestamp | Resolución de conflictos offline |

### 4.2 Implementación con Version Column

```typescript
// inventory/inventory.service.ts
async updateInventory(hotelId: string, roomTypeId: string, date: Date, delta: number, expectedVersion: number, correlationId: string): Promise<Inventory> {
  const maxRetries = 3;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const [current] = await tx.$queryRawUnsafe<InventoryRow[]>(
          `SELECT * FROM inventory WHERE hotel_id = $1 AND room_type_id = $2 AND date = $3 FOR UPDATE`,
          hotelId, roomTypeId, date,
        );
        if (!current) throw new NotFoundException('Inventario no encontrado');
        if (current.version !== expectedVersion) {
          throw new ConflictException({ statusCode: 409, error: 'VERSION_CONFLICT', message: 'El inventario fue modificado. Recarga e intenta de nuevo.', code: 'OPTIMISTIC_LOCK_CONFLICT' });
        }
        const newAvailable = current.available_rooms + delta;
        if (newAvailable < 0) throw new BadRequestException({ error: 'INVENTORY_EXCEEDED', message: `No hay suficientes habitaciones. Disponibles: ${current.available_rooms}` });
        await tx.$executeRawUnsafe(
          `UPDATE inventory SET available_rooms = available_rooms + $1, booked_rooms = booked_rooms + $2, version = version + 1, updated_at = NOW() WHERE hotel_id = $3 AND room_type_id = $4 AND date = $5 AND version = $6`,
          delta, delta < 0 ? Math.abs(delta) : 0, hotelId, roomTypeId, date, expectedVersion,
        );
        const [result] = await tx.$queryRawUnsafe<InventoryRow[]>(
          `SELECT * FROM inventory WHERE hotel_id = $1 AND room_type_id = $2 AND date = $3`,
          hotelId, roomTypeId, date,
        );
        return result;
      });
    } catch (error) {
      if (attempt < maxRetries - 1 && this.isRetryable(error)) {
        await this.delay(100 * Math.pow(2, attempt));
        continue;
      }
      throw error;
    }
  }
}
```

### 4.3 SERIALIZABLE Isolation para Booking

```typescript
async createBooking(dto: CreateBookingDto): Promise<Booking> {
  const idempotencyKey = dto.idempotencyKey || uuidv4();
  const existing = await this.prisma.booking.findUnique({ where: { idempotencyKey } });
  if (existing) return existing;

  return this.prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');
    for (const room of dto.rooms) {
      const [inv] = await tx.$queryRawUnsafe<InventoryRow[]>(
        `SELECT * FROM inventory WHERE hotel_id = $1 AND room_type_id = $2 AND date = $3 AND available_rooms > 0 FOR UPDATE`,
        dto.hotelId, room.roomTypeId, room.date,
      );
      if (!inv) throw new BadRequestException({ error: 'INVENTORY_UNAVAILABLE', message: `Sin disponibilidad para ${room.date}` });
      await tx.$executeRawUnsafe(
        `UPDATE inventory SET available_rooms = available_rooms - 1, booked_rooms = booked_rooms + 1, version = version + 1 WHERE hotel_id = $1 AND room_type_id = $2 AND date = $3 AND available_rooms > 0`,
        dto.hotelId, room.roomTypeId, room.date,
      );
    }
    return tx.booking.create({ data: { ...dto, idempotencyKey, status: 'CONFIRMED', rooms: { create: dto.rooms.map(r => ({ roomTypeId: r.roomTypeId, date: new Date(r.date), amount: r.amount })) } } });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, maxWait: 5000, timeout: 10000 });
}
```

### 4.4 Retry con Exponential Backoff

```typescript
export async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3, baseDelay = 100): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try { return await fn(); }
    catch (error) {
      if (attempt < maxRetries - 1) await new Promise(r => setTimeout(r, baseDelay * Math.pow(2, attempt)));
      else throw error;
    }
  }
}
```


## 5. Offline Sync Architecture

### 5.1 Arquitectura General

```
┌─────────────────────────────────────────────────────────────────┐
│                        NAVEGADOR (PWA)                          │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │  IndexedDB   │    │Service Worker │    │  UI Layer    │      │
│  │  (Dexie.js)  │◄──►│  (Cache +     │◄──►│  (Next.js)   │      │
│  │              │    │   Background  │    │              │      │
│  │  • rooms     │    │   Sync)       │    │  • Dashboard │      │
│  │  • inventory │    │              │    │  • Inventory │      │
│  │  • bookings  │    │  Online→API  │    │  • Bookings  │      │
│  │  • pendingOps│    │  Offline→DB  │    │  • Settings  │      │
│  └──────┬───────┘    └──────┬───────┘    └──────────────┘      │
│         └───────────────────┼───────────────────────────────────┘
└─────────────────────────────┼───────────────────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │    API NestJS      │
                    │  Conflict Resolver │
                    └─────────┬─────────┘
                              │
                    ┌─────────▼─────────┐
                    │    PostgreSQL      │
                    │  (Source of Truth) │
                    └───────────────────┘
```

### 5.2 IndexedDB Schema (Dexie.js)

```typescript
import Dexie from 'dexie';

interface PendingOperation {
  id?: number; operationId: string; type: 'CREATE'|'UPDATE'|'DELETE';
  resource: 'inventory'|'booking'|'rate'|'room'; payload: any;
  createdAt: number; retryCount: number; lastError?: string;
}

interface LocalInventory {
  hotelId: string; roomTypeId: string; date: string;
  totalRooms: number; availableRooms: number; bookedRooms: number;
  version: number; syncedAt: number;
}

const db = new Dexie('HotelPlatformDB');
db.version(1).stores({
  inventory: '[hotelId+roomTypeId+date], hotelId, roomTypeId, date, version',
  bookings: 'localId, hotelId, status, createdAt',
  pendingOps: '++id, operationId, type, resource, createdAt',
  syncMeta: 'key',
});
export default db;
```

### 5.3 Sync Manager

```typescript
class SyncManager {
  private isSyncing = false; private maxRetries = 5;

  async enqueueOperation(type, resource, payload): Promise<void> {
    await db.pendingOps.add({ operationId: uuidv4(), type, resource, payload, createdAt: Date.now(), retryCount: 0 });
    if (navigator.onLine) await this.processQueue();
    else this.registerBackgroundSync();
  }

  async processQueue(): Promise<void> {
    if (this.isSyncing) return; this.isSyncing = true;
    try {
      const ops = await db.pendingOps.orderBy('createdAt').toArray();
      for (const op of ops) {
        try {
          await this.executeOperation(op);
          await db.pendingOps.delete(op.id!);
        } catch (error) {
          op.retryCount++; op.lastError = error.message;
          if (op.retryCount >= this.maxRetries) await this.moveToDeadLetter(op);
          else await db.pendingOps.put(op);
        }
      }
    } finally { this.isSyncing = false; }
  }

  private async executeOperation(op: PendingOperation): Promise<void> {
    const headers = { 'Content-Type': 'application/json', 'X-Idempotency-Key': op.operationId, 'X-Offline-Timestamp': op.createdAt.toString() };
    if (op.resource === 'inventory') await fetch('/api/v1/inventory/update', { method: 'PATCH', headers, body: JSON.stringify(op.payload) });
    if (op.resource === 'booking') await fetch('/api/v1/bookings', { method: 'POST', headers, body: JSON.stringify({ ...op.payload, idempotencyKey: op.operationId }) });
  }

  private registerBackgroundSync(): void {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready.then(r => r.sync.register('sync-pending-operations'));
    }
  }

  setupConnectivityListeners(): void {
    window.addEventListener('online', () => { this.processQueue(); this.syncLatestData(); });
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data.type === 'PROCESS_PENDING_OPS') this.processQueue();
    });
  }

  private async syncLatestData(): Promise<void> {
    const resp = await fetch('/api/v1/availability/bulk?from=2026-01-01&to=2027-12-31');
    const data = await resp.json();
    await db.transaction('rw', db.inventory, db.syncMeta, async () => {
      for (const item of data) await db.inventory.put({ ...item, syncedAt: Date.now() });
      await db.syncMeta.put({ key: 'lastSync', value: Date.now() });
    });
  }
}
export const syncManager = new SyncManager();
```

### 5.4 Estrategia de Merge (Last-Write-Wins con Timestamp)

```typescript
@Post('sync') @UseGuards(JwtAuthGuard)
async syncOfflineChanges(@Body() dto: OfflineSyncDto, @CurrentUser() user: JwtPayload): Promise<SyncResultDto> {
  const results: SyncResultItem[] = [];
  for (const change of dto.changes) {
    const serverInv = await this.prisma.inventory.findUnique({
      where: { hotelId_roomTypeId_date: { hotelId: user.hotelId, roomTypeId: change.roomTypeId, date: new Date(change.date) } },
    });
    if (!serverInv) { /* crear */ results.push({ ...change, status: 'accepted' }); continue; }
    if (change.offlineTimestamp > serverInv.updatedAt.getTime()) {
      try {
        await this.updateInventoryRaw(user.hotelId, change.roomTypeId, new Date(change.date), change.availableRooms - serverInv.availableRooms, serverInv.version);
        results.push({ ...change, status: 'accepted', serverVersion: serverInv.version + 1 });
      } catch { results.push({ ...change, status: 'rejected', reason: 'CONCURRENT_MODIFICATION', serverData: serverInv }); }
    } else results.push({ ...change, status: 'rejected', reason: 'SERVER_NEWER', serverData: serverInv });
  }
  return { results };
}
```


## 6. BullMQ Queue Design

### 6.1 Colas Definidas

| Cola | Propósito | Jobs/día | Rate Limit |
|---|---|---|---|
| `ota-sync` | Push/pull disponibilidad, tarifas, reservas a OTAs | ~10,000 | 10/min por OTA |
| `notifications` | WhatsApp y notificaciones push | ~1,000 | 60/min |
| `reconciliation` | Comparación periódica inventario local vs OTA | ~288 (c/5 min) | — |
| `email` | Emails transaccionales | ~200 | 30/min |
| `reports` | Reportes semanales/mensuales | ~50 | — |
| `audit` | Batch insert de audit logs | ~5,000 | 500/min |
| `backup` | Backup diario de BD | 1 | — |
| `whatsapp-health` | Health check sesiones OpenWA | ~288 (c/5 min) | — |

### 6.2 Configuración y Jobs

```typescript
export const QUEUES = { OTA_SYNC: 'ota-sync', NOTIFICATIONS: 'notifications', RECONCILIATION: 'reconciliation', EMAIL: 'email', REPORTS: 'reports', AUDIT: 'audit', BACKUP: 'backup', WHATSAPP_HEALTH: 'whatsapp-health' };

export interface OTASyncJob { hotelId: string; channel: ChannelType; action: 'pushAvailability' | 'pushRates' | 'pullBookings'; payload: any; correlationId: string; }
export interface NotificationJob { hotelId: string; channel: 'whatsapp'|'email'; to: string; template: string; data: Record<string, any>; correlationId: string; }
export interface ReconciliationJob { hotelId: string; channel: ChannelType; from: string; to: string; }
export interface EmailJob { to: string; subject: string; template: string; data: Record<string, any>; correlationId: string; }
export interface AuditJob { entries: Array<{ correlationId: string; hotelId: string; userId: string; action: string; resource: string; resourceId: string; oldValue?: any; newValue?: any; ip: string; userAgent: string; }>; }
```

### 6.3 Procesador OTA Sync

```typescript
@Processor(QUEUES.OTA_SYNC)
export class OTASyncProcessor extends WorkerHost {
  constructor(private bookingConnector: BookingConnector, private despegarConnector: DespegarConnector, private prisma: PrismaService) { super(); }

  async process(job: Job<OTASyncJob>): Promise<any> {
    const { hotelId, channel, action, payload, correlationId } = job.data;
    try {
      const connector = channel === 'BOOKING_COM' ? this.bookingConnector : this.despegarConnector;
      switch (action) {
        case 'pushAvailability': return await connector.pushAvailability(hotelId, payload);
        case 'pushRates': return await connector.pushRates(hotelId, payload);
        case 'pullBookings': return await connector.pullBookings(hotelId, payload.from, payload.to);
      }
    } catch (error) {
      await this.prisma.jobLog.create({ data: { queueName: QUEUES.OTA_SYNC, jobId: job.id!, jobName: `${channel}.${action}`, data: { hotelId, channel, action }, status: 'failed', error: error.message, attempts: job.attemptsMade } });
      throw error;
    }
  }
}

// Jobs programados
@Injectable()
export class ScheduledJobsService {
  async onModuleInit() {
    await this.reconciliationQueue.upsertJobScheduler('reconciliation-5min', { pattern: '*/5 * * * *' }, { name: 'run-reconciliation', data: { type: 'all' } });
    await this.backupQueue.upsertJobScheduler('backup-daily', { pattern: '0 3 * * *' }, { name: 'run-backup', data: { type: 'full' } });
    await this.reportsQueue.upsertJobScheduler('weekly-report', { pattern: '0 8 * * 1' }, { name: 'generate-weekly-report', data: {} });
    await this.whatsappHealthQueue.upsertJobScheduler('whatsapp-health', { pattern: '*/5 * * * *' }, { name: 'check-whatsapp-sessions', data: {} });
  }
}
```


## 7. OpenWA Integration Detail

### 7.1 WhatsAppAdapter Interface

```typescript
export interface MessageResult { messageId: string; status: 'sent'|'failed'|'queued'; providerMessageId?: string; error?: string; }
export interface SessionResult { sessionId: string; qrCode?: string; status: SessionStatus; }
export interface SessionStatus { connected: boolean; phoneNumber?: string; lastSeen?: Date; batteryLevel?: number; }
export interface TemplateMessage { templateName: string; language: string; components: TemplateComponent[]; }
export interface TemplateComponent { type: 'header'|'body'|'footer'|'button'; parameters: { type: 'text'|'image'|'button'; value: string }[]; }

export interface WhatsAppAdapter {
  readonly provider: string;
  sendText(to: string, message: string): Promise<MessageResult>;
  sendTemplate(to: string, template: TemplateMessage): Promise<MessageResult>;
  sendImage(to: string, imageUrl: string, caption?: string): Promise<MessageResult>;
  createSession(hotelId: string): Promise<SessionResult>;
  getQRCode(sessionId: string): Promise<string>;
  getSessionStatus(sessionId: string): Promise<SessionStatus>;
  disconnectSession(sessionId: string): Promise<void>;
  healthCheck(): Promise<boolean>;
}
```

### 7.2 OpenWA Provider

```typescript
@Injectable()
export class OpenWAProvider implements WhatsAppAdapter {
  readonly provider = 'openwa';
  private readonly baseUrl: string;
  private readonly webhookUrl: string;
  constructor() {
    this.baseUrl = process.env.OPENWA_URL || 'http://localhost:2785';
    this.webhookUrl = process.env.OPENWA_WEBHOOK_URL || 'https://api.hotelplatform.com/api/v1/whatsapp/webhook';
  }

  async sendText(to: string, message: string): Promise<MessageResult> {
    try {
      const response = await axios.post(`${this.baseUrl}/api/sessions/${to}/messages/send-text`, { text: message }, { timeout: 10000 });
      return { messageId: response.data?.messageId || uuidv4(), status: 'sent', providerMessageId: response.data?.id };
    } catch (error) { return { messageId: uuidv4(), status: 'failed', error: error.message }; }
  }

  async createSession(hotelId: string): Promise<SessionResult> {
    const response = await axios.post(`${this.baseUrl}/api/sessions/init`, { sessionId: hotelId, webhook: { url: `${this.webhookUrl}?hotelId=${hotelId}`, events: ['message','qr','connection','disconnection'] } }, { timeout: 30000 });
    return { sessionId: response.data?.sessionId || hotelId, qrCode: response.data?.qrCode, status: 'connecting' };
  }

  async getQRCode(sessionId: string): Promise<string> {
    const response = await axios.get(`${this.baseUrl}/api/sessions/${sessionId}/qr`, { timeout: 10000 });
    return response.data?.qrCode || response.data;
  }

  async getSessionStatus(sessionId: string): Promise<SessionStatus> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/sessions/${sessionId}/status`, { timeout: 5000 });
      return { connected: response.data?.status === 'connected', phoneNumber: response.data?.phoneNumber, lastSeen: response.data?.lastSeen ? new Date(response.data.lastSeen) : undefined, batteryLevel: response.data?.battery };
    } catch { return { connected: false }; }
  }

  async healthCheck(): Promise<boolean> {
    try { const r = await axios.get(`${this.baseUrl}/api/health`, { timeout: 5000 }); return r.status === 200; } catch { return false; }
  }
}
```

### 7.3 QR Linking Flow

```typescript
@Controller('api/v1/whatsapp')
export class WhatsAppController {
  @Post('link') @UseGuards(JwtAuthGuard)
  async initiateLink(@CurrentUser() user: JwtPayload): Promise<{ sessionId: string; qrCode: string; expiresAt: Date }> {
    const result = await this.whatsappService.createSession(user.hotelId);
    await this.whatsappService.saveSession(user.hotelId, result);
    return { sessionId: result.sessionId, qrCode: result.qrCode!, expiresAt: new Date(Date.now() + 120_000) };
  }

  @Get('qr/:sessionId') @UseGuards(JwtAuthGuard)
  async getQRCode(@Param('sessionId') sessionId: string): Promise<{ qrCode: string }> {
    return { qrCode: await this.whatsappService.getQRCode(sessionId) };
  }

  @Get('status/:sessionId') @UseGuards(JwtAuthGuard)
  async getStatus(@Param('sessionId') sessionId: string): Promise<{ connected: boolean; phoneNumber?: string }> {
    return this.whatsappService.getSessionStatus(sessionId);
  }
}
```

### 7.4 Health Monitor de Sesiones

```typescript
@Processor(QUEUES.WHATSAPP_HEALTH)
export class WhatsAppHealthProcessor extends WorkerHost {
  async process(job: Job): Promise<void> {
    const sessions = await this.prisma.whatsAppSession.findMany({ where: { status: { in: ['connected','connecting'] } }, include: { hotel: { select: { name: true } } } });
    for (const session of sessions) {
      const status = await this.whatsappAdapter.getSessionStatus(session.sessionId);
      if (!status.connected) {
        await this.prisma.whatsAppSession.update({ where: { id: session.id }, data: { status: 'disconnected' } });
        await this.notificationsService.sendAdminAlert({ type: 'WHATSAPP_DISCONNECTED', hotelId: session.hotelId, message: `WhatsApp desconectado para ${session.hotel.name}` });
        await this.attemptReconnection(session);
      }
    }
  }

  private async attemptReconnection(session: any): Promise<void> {
    await this.whatsappAdapter.disconnectSession(session.sessionId);
    const result = await this.whatsappAdapter.createSession(session.hotelId);
    await this.prisma.whatsAppSession.update({ where: { id: session.id }, data: { sessionId: result.sessionId, qrCode: result.qrCode, status: 'connecting', qrExpiresAt: new Date(Date.now() + 120_000) } });
  }
}
```


## 8. Error Handling Strategy

### 8.1 Jerarquía de Excepciones

```typescript
export class AppException extends HttpException {
  constructor(message: string, status: number, public code: string, public details?: any) {
    super({ statusCode: status, error: code, message, code, details, timestamp: new Date().toISOString() }, status);
  }
}

export class ValidationException extends AppException { constructor(errors: any[]) { super('Error de validación', 400, 'VALIDATION_ERROR', errors); } }
export class PlanLimitExceededException extends AppException { constructor(feature: string, plan: string) { super(`Tu plan ${plan} no incluye ${feature}`, 403, 'PLAN_LIMIT_EXCEEDED'); } }
export class ResourceNotFoundException extends AppException { constructor(resource: string, id: string) { super(`${resource} no encontrado: ${id}`, 404, 'RESOURCE_NOT_FOUND'); } }
export class VersionConflictException extends AppException { constructor(resource: string, cv: number, ev: number) { super(`Conflicto de versión en ${resource}`, 409, 'VERSION_CONFLICT', { currentVersion: cv, expectedVersion: ev }); } }
export class IdempotencyConflictException extends AppException { constructor(key: string) { super('Operación duplicada', 409, 'IDEMPOTENCY_CONFLICT', { key }); } }
export class RateLimitException extends AppException { constructor(retryAfter: number) { super('Demasiadas solicitudes', 429, 'RATE_LIMIT_EXCEEDED', { retryAfter }); } }
export class OTAException extends AppException { constructor(channel: string, op: string, err: string) { super(`Error ${channel}: ${err}`, 502, 'OTA_ERROR', { channel, operation: op }); } }
export class CircuitBreakerOpenException extends AppException { constructor(service: string) { super(`${service} no disponible temporalmente`, 503, 'CIRCUIT_BREAKER_OPEN'); } }
```

### 8.2 Global Exception Filter

```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private sentryService?: SentryService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const correlationId = request['correlationId'] || uuidv4();

    let status = 500;
    let body: any = { statusCode: 500, error: 'INTERNAL_ERROR', message: 'Error interno', code: 'INTERNAL_ERROR', correlationId, timestamp: new Date().toISOString(), path: request.url };

    if (exception instanceof AppException) { status = exception.getStatus(); body = { ...(exception.getResponse() as any), correlationId, timestamp: new Date().toISOString(), path: request.url }; }
    else if (exception instanceof HttpException) {
      status = exception.getStatus(); const res = exception.getResponse();
      body = { statusCode: status, error: typeof res === 'string' ? res : (res as any).error || 'HTTP_ERROR', message: typeof res === 'string' ? res : (res as any).message, code: `HTTP_${status}`, correlationId, timestamp: new Date().toISOString(), path: request.url };
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      status = { P2002: 409, P2025: 404, P2003: 400, P2034: 409 }[exception.code] || 500;
      body = { statusCode: status, error: 'DATABASE_ERROR', message: { P2002: 'Registro duplicado', P2025: 'No encontrado', P2003: 'Integridad referencial', P2034: 'Conflicto de transacción' }[exception.code] || 'Error de BD', code: `DB_${exception.code}`, correlationId, timestamp: new Date().toISOString(), path: request.url };
    } else if (this.sentryService) this.sentryService.captureException(exception, { tags: { correlationId, path: request.url } });

    response.status(status).json(body);
  }
}
```

### 8.3 Códigos de Error Estándar

| Código | HTTP | Descripción |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Error de validación de entrada |
| `INVENTORY_UNAVAILABLE` | 400 | No hay habitaciones disponibles |
| `INVENTORY_EXCEEDED` | 400 | Se intentó overbooking |
| `FLOOR_PRICE_VIOLATION` | 400 | Tarifa por debajo del floor price |
| `UNAUTHORIZED` | 401 | Token faltante, inválido o expirado |
| `PLAN_LIMIT_EXCEEDED` | 403 | El plan no incluye esta feature |
| `ROLE_FORBIDDEN` | 403 | El rol no tiene permiso |
| `RESOURCE_NOT_FOUND` | 404 | Entidad no encontrada |
| `VERSION_CONFLICT` | 409 | Optimistic locking conflict |
| `IDEMPOTENCY_CONFLICT` | 409 | Llave de idempotencia duplicada |
| `RATE_LIMIT_EXCEEDED` | 429 | Demasiadas solicitudes |
| `OTA_ERROR` | 502 | Error en comunicación con OTA |
| `CIRCUIT_BREAKER_OPEN` | 503 | Circuit breaker abierto |
| `INTERNAL_ERROR` | 500 | Error interno no clasificado |

### 8.4 Circuit Breaker

```typescript
export class CircuitBreaker {
  private failures = 0; private lastFailure = 0; private state: 'CLOSED'|'OPEN'|'HALF_OPEN' = 'CLOSED';
  constructor(private name: string, private threshold = 5, private resetTimeout = 30000) {}

  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailure >= this.resetTimeout) this.state = 'HALF_OPEN';
      else throw new CircuitBreakerOpenException(this.name);
    }
    try {
      const result = await fn();
      if (this.state === 'HALF_OPEN') { this.failures = 0; this.state = 'CLOSED'; }
      return result;
    } catch (error) {
      this.failures++; this.lastFailure = Date.now();
      if (this.failures >= this.threshold) this.state = 'OPEN';
      throw error;
    }
  }
}
```


## 9. Security Deep Dive

### 9.1 JWT Strategy

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_PUBLIC_KEY,
      algorithms: ['RS256'],
      ignoreExpiration: false,
    });
  }
  async validate(payload: JwtPayload): Promise<JwtPayload> {
    return { sub: payload.sub, email: payload.email, hotelId: payload.hotelId, role: payload.role, plan: payload.plan, isFounder: payload.isFounder };
  }
}

// Payload
export interface JwtPayload { sub: string; email: string; hotelId: string; role: UserRole; plan: PlanType; isFounder: boolean; iat?: number; exp?: number; }

// Login + Refresh Token
async login(dto: LoginDto): Promise<{ accessToken: string; refreshToken: string; user: UserProfile }> {
  const user = await this.validateUser(dto.email, dto.password);
  const payload: JwtPayload = { sub: user.id, email: user.email, hotelId: user.hotelId, role: user.role, plan: user.hotel.plan, isFounder: user.hotel.isFounder };
  const accessToken = this.jwtService.sign(payload, { expiresIn: '15m', algorithm: 'RS256' });
  const refreshToken = uuidv4();
  await this.redisService.set(`refresh:${refreshToken}`, { userId: user.id, hotelId: user.hotelId }, 7 * 24 * 60 * 60);
  return { accessToken, refreshToken, user: this.toProfile(user) };
}
```

### 9.2 Rate Limiting

```typescript
// app.module.ts — config
ThrottlerModule.forRootAsync({
  imports: [RedisModule], inject: [RedisService],
  useFactory: (redis: RedisService) => ({
    throttlers: [
      { name: 'short', ttl: 1000, limit: 10 },
      { name: 'medium', ttl: 60000, limit: 100 },
    ],
    storage: new RedisStorage(redis.getClient()),
  }),
});

// Uso en controlador
@Throttle({ default: { limit: 60, ttl: 60000 } })
@Patch(':roomTypeId/:date') @UseGuards(JwtAuthGuard, ThrottlerGuard)
async updateInventory(...) { ... }
```

### 9.3 CORS y Helmet

```typescript
app.enableCors({
  origin: (process.env.ALLOWED_ORIGINS || 'https://app.hotelplatform.com,https://admin.hotelplatform.com').split(','),
  methods: ['GET','POST','PUT','PATCH','DELETE'],
  allowedHeaders: ['Content-Type','Authorization','X-Idempotency-Key','X-Correlation-Id'],
  exposedHeaders: ['X-Resource-Version','X-RateLimit-Remaining'],
  credentials: true, maxAge: 86400,
});

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"], scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"], imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.hotelplatform.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
}));
```

### 9.4 API Key Management (AES-256-GCM)

```typescript
import * as crypto from 'crypto';
const KEY = crypto.scryptSync(process.env.ENCRYPTION_KEY!, 'hotel-platform-salt', 32);

export function encrypt(text: string): { encrypted: string; iv: string; tag: string } {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex'); encrypted += cipher.final('hex');
  return { encrypted, iv: iv.toString('hex'), tag: cipher.getAuthTag().toString('hex') };
}

export function decrypt(encrypted: string, ivHex: string, tagHex: string): string {
  const decipher = crypto.createDecipheriv('aes-256-gcm', KEY, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  let decrypted = decipher.update(encrypted, 'hex', 'utf8'); decrypted += decipher.final('utf8');
  return decrypted;
}
```

### 9.5 Audit Log Retention

```sql
-- BullMQ job schedule: cleanup diario
DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '90 days';
DELETE FROM channel_reservations WHERE created_at < NOW() - INTERVAL '30 days';
DELETE FROM job_logs WHERE created_at < NOW() - INTERVAL '30 days';
-- Bookings e invoices se archivan a 1 año (compliance DIAN)
```


## 10. Testing Strategy

### 10.1 Unit Tests (Jest)

| Módulo | Cobertura target | Escenarios clave |
|---|---|---|
| `InventoryService` | >85% | Optimistic locking (success, conflict, retry), cache invalidation, bulk availability |
| `BookingService` | >85% | Create booking (happy path, inventory unavailable, idempotency, SERIALIZABLE retry) |
| `RateService` | >80% | Rate calculation (BAR, derived, seasonal multiplier), floor price enforcement |
| `PromotionService` | >80% | Discount calc, stacking validation, margin enforcement |
| `AuthService` | >90% | Login, register, refresh token, password reset, rate limiting |

```typescript
// inventory.service.spec.ts — ejemplo
describe('InventoryService', () => {
  let service: InventoryService;
  let prisma: MockProxy<PrismaService>;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [InventoryService, { provide: PrismaService, useValue: mockDeep<PrismaService>() }, { provide: RedisService, useValue: mockDeep<RedisService>() }],
    }).compile();
    service = module.get(InventoryService);
  });

  describe('updateInventory', () => {
    it('should decrement available_rooms and increment version on success', async () => { /* ... */ });
    it('should throw VersionConflictException when version mismatches', async () => { /* ... */ });
    it('should retry on serialization failure with exponential backoff', async () => { /* ... */ });
    it('should throw INVENTORY_EXCEEDED when available_rooms would go negative', async () => { /* ... */ });
    it('should invalidate Redis cache after successful update', async () => { /* ... */ });
  });
});
```

### 10.2 Integration Tests (Supertest)

```typescript
describe('POST /api/v1/bookings', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
    // Crear test data
    const resp = await request(app.getHttpServer()).post('/api/v1/auth/register').send({ email: 'test@hotel.com', password: 'Test123!', hotelName: 'Test Hotel', name: 'Test User' });
    authToken = resp.body.accessToken;
  });

  it('should create booking and decrement inventory', async () => {
    const res = await request(app.getHttpServer()).post('/api/v1/bookings').set('Authorization', `Bearer ${authToken}`).send(createBookingDto());
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('CONFIRMED');
    // Verificar inventario decrementado
    const inv = await prisma.inventory.findUnique({ where: { hotelId_roomTypeId_date: { hotelId, roomTypeId, date } } });
    expect(inv.availableRooms).toBeLessThan(originalAvailable);
  });
});
```

### 10.3 Mock OTA Server

```
tests/mock-ota/
├── server.ts                          # Express server (puerto 3001)
├── booking/
│   ├── availability.get.ts            # GET /mock/booking/availability
│   ├── ari.post.ts                    # POST /mock/booking/ari
│   └── webhook.post.ts               # POST /mock/booking/webhook
├── despegar/
│   ├── rates.post.ts                  # POST /mock/despegar/rates
│   └── bookings.get.ts               # GET /mock/despegar/bookings
└── scenarios/
    ├── success.ts                     # Respuesta 200 OK
    ├── rate-limit.ts                  # Respuesta 429 + Retry-After
    ├── timeout.ts                     # No responde por >5s
    ├── server-error.ts                # Respuesta 500
    └── partial-failure.ts             # Algunos rates OK, otros no
```

### 10.4 Load Tests (k6)

```javascript
// tests/load/availability.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Ramp up
    { duration: '1m', target: 100 },  // Sostener 100 usuarios
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(99)<200'], // SLA: p99 < 200ms
    http_req_failed: ['rate<0.01'],   // <1% error rate
  },
};

export default function () {
  const res = http.get('https://api.hotelplatform.com/api/v1/availability/bulk?hotelId=test&from=2026-07-01&to=2026-07-31');
  check(res, { 'status 200': (r) => r.status === 200 });
  sleep(1);
}
```

Escenarios de carga:
| Escenario | Usuarios | SLA | Frecuencia |
|---|---|---|---|
| Availability bulk | 100 concurrentes | p99 < 200ms | Cada release |
| Booking creation | 10 bookings/s | p99 < 2s, 0% error | Cada release |
| Redis cache miss | 50 concurrentes (sin cache) | p99 < 1s | Semanal |
| Mixed (80% reads, 20% writes) | 200 concurrentes | p99 < 500ms reads, < 2s writes | Pre-release |

### 10.5 Tests de Seguridad

| Test | Descripción |
|---|---|
| JWT expirado → 401 | Token con exp pasado |
| JWT key incorrecta → 401 | Firma inválida |
| Refresh token usado 2 veces → 401 | Reuse detection |
| Rate limit login: 6to intento en 1 min → 429 | Brute force protection |
| Hotel A accede inventory Hotel B → 403/empty | RLS isolation |
| Usuario staff intenta acción admin → 403 | Role enforcement |
| Plan free intenta 6ta habitación → 403 | Plan limit |
| HMAC inválido en webhook OTA → 401 | Webhook auth |
| Idempotency key reusada → 409 | Duplicate prevention |


## 11. API Contract (OpenAPI 3.0)

### 11.1 Endpoints del MVP

```yaml
openapi: 3.0.3
info:
  title: Hotel Platform API
  version: 1.0.0
  description: API del Channel Manager + Revenue Management para hoteles independientes
servers:
  - url: https://api.hotelplatform.com/api/v1

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    Error:
      type: object
      properties:
        statusCode: { type: integer }
        error: { type: string }
        message: { type: string }
        code: { type: string }
        correlationId: { type: string, format: uuid }
        timestamp: { type: string, format: date-time }
        details: { type: object }

    Pagination:
      type: object
      properties:
        data: { type: array }
        cursor: { type: string, nullable: true }
        hasMore: { type: boolean }

paths:
  # ───────────── AUTH ─────────────
  /auth/register:
    post:
      tags: [Auth]
      summary: Registrar nuevo hotel + usuario admin
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email, password, hotelName, name]
              properties:
                email: { type: string, format: email }
                password: { type: string, minLength: 8 }
                hotelName: { type: string, maxLength: 200 }
                name: { type: string, maxLength: 200 }
                phone: { type: string }
      responses:
        '201':
          description: Hotel y usuario creados
          content:
            application/json:
              schema:
                type: object
                properties:
                  accessToken: { type: string }
                  refreshToken: { type: string }
                  user: { $ref: '#/components/schemas/UserProfile' }
        '409':
          description: Email ya registrado

  /auth/login:
    post:
      tags: [Auth]
      summary: Iniciar sesión
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email, password]
              properties:
                email: { type: string }
                password: { type: string }
      responses:
        '200':
          description: Login exitoso
          content:
            application/json:
              schema:
                type: object
                properties:
                  accessToken: { type: string }
                  refreshToken: { type: string }
                  user: { $ref: '#/components/schemas/UserProfile' }
        '401':
          description: Credenciales inválidas

  /auth/refresh:
    post:
      tags: [Auth]
      summary: Refrescar access token
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                refreshToken: { type: string }
      responses:
        '200':
          description: Token refrescado
          content:
            application/json:
              schema:
                type: object
                properties:
                  accessToken: { type: string }
                  refreshToken: { type: string }

  # ───────────── HOTELS ─────────────
  /hotels/me:
    get:
      tags: [Hotels]
      summary: Obtener perfil del hotel autenticado
      security: [{ bearerAuth: [] }]
      responses:
        '200':
          description: Perfil del hotel
          content:
            application/json:
              schema:
                type: object
                properties:
                  id: { type: string, format: uuid }
                  name: { type: string }
                  slug: { type: string }
                  plan: { $ref: '#/components/schemas/PlanType' }
                  isFounder: { type: boolean }
                  roomsCount: { type: integer }
                  channelsCount: { type: integer }

  # ───────────── INVENTORY ─────────────
  /availability:
    get:
      tags: [Inventory]
      summary: Consultar disponibilidad
      security: [{ bearerAuth: [] }]
      parameters:
        - name: roomTypeId
          in: query
          schema: { type: string, format: uuid }
        - name: from
          in: query
          required: true
          schema: { type: string, format: date }
        - name: to
          in: query
          required: true
          schema: { type: string, format: date }
      responses:
        '200':
          description: Matriz de disponibilidad
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    date: { type: string, format: date }
                    roomTypeId: { type: string }
                    totalRooms: { type: integer }
                    availableRooms: { type: integer }
                    rate: { type: number }

  /inventory/{roomTypeId}/{date}:
    patch:
      tags: [Inventory]
      summary: Actualizar inventario (ocupar/liberar)
      security: [{ bearerAuth: [] }]
      parameters:
        - name: roomTypeId
          in: path
          required: true
          schema: { type: string, format: uuid }
        - name: date
          in: path
          required: true
          schema: { type: string, format: date }
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [delta, version]
              properties:
                delta: { type: integer, description: "+1 liberar, -1 ocupar" }
                version: { type: integer, description: "Optimistic lock token" }
      responses:
        '200':
          description: Inventario actualizado
          headers:
            X-Resource-Version: { schema: { type: integer } }
        '409':
          description: Version conflict — recargar y reintentar

  # ───────────── BOOKINGS ─────────────
  /bookings:
    post:
      tags: [Bookings]
      summary: Crear reserva
      security: [{ bearerAuth: [] }]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [guestName, checkinDate, checkoutDate, rooms]
              properties:
                guestName: { type: string, maxLength: 200 }
                guestEmail: { type: string, format: email }
                guestPhone: { type: string }
                checkinDate: { type: string, format: date }
                checkoutDate: { type: string, format: date }
                channel: { $ref: '#/components/schemas/ChannelType' }
                channelBookingId: { type: string }
                rooms:
                  type: array
                  items:
                    type: object
                    properties:
                      roomTypeId: { type: string }
                      ratePlanId: { type: string }
                      date: { type: string, format: date }
                      amount: { type: number }
                idempotencyKey: { type: string }
      responses:
        '201':
          description: Reserva creada
        '400':
          description: Inventario insuficiente
        '409':
          description: Idempotency conflict

  /bookings/{id}/cancel:
    post:
      tags: [Bookings]
      summary: Cancelar reserva
      security: [{ bearerAuth: [] }]
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string, format: uuid }
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                reason: { type: string }
      responses:
        '200':
          description: Reserva cancelada, inventario restaurado

  # ───────────── RATES ─────────────
  /rate-plans:
    get: { tags: [Rates], security: [{ bearerAuth: [] }], responses: { '200': { description: Lista de rate plans } } }
    post: { tags: [Rates], security: [{ bearerAuth: [] }], responses: { '201': { description: Rate plan creado } } }

  /rates/bulk:
    patch:
      tags: [Rates]
      summary: Actualizar tarifas en batch
      security: [{ bearerAuth: [] }]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: array
              items:
                type: object
                properties:
                  roomTypeId: { type: string }
                  ratePlanId: { type: string }
                  date: { type: string, format: date }
                  amount: { type: number }
                  version: { type: integer }
      responses: { '200': { description: Tarifas actualizadas } }

  # ───────────── CHANNELS ─────────────
  /channels/connect:
    post:
      tags: [Channels]
      summary: Conectar canal OTA
      security: [{ bearerAuth: [] }]
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required: [channel, apiKey, apiSecret]
              properties:
                channel: { $ref: '#/components/schemas/ChannelType' }
                apiKey: { type: string }
                apiSecret: { type: string }
      responses: { '201': { description: Canal conectado } }

  /channels/{channel}/webhook:
    post:
      tags: [Channels]
      summary: Webhook para notificaciones de OTAs
      parameters:
        - name: channel
          in: path
          required: true
          schema: { type: string }
      responses: { '200': { description: Webhook procesado } }

  # ───────────── WHATSAPP ─────────────
  /whatsapp/link:
    post:
      tags: [WhatsApp]
      summary: Iniciar vinculación WhatsApp
      security: [{ bearerAuth: [] }]
      responses:
        '200':
          description: QR generado
          content:
            application/json:
              schema:
                type: object
                properties:
                  sessionId: { type: string }
                  qrCode: { type: string, description: "Base64 PNG del QR" }
                  expiresAt: { type: string, format: date-time }

  /whatsapp/qr/{sessionId}:
    get:
      tags: [WhatsApp]
      summary: Obtener QR actualizado
      security: [{ bearerAuth: [] }]
      responses: { '200': { description: QR code } }

  /whatsapp/webhook:
    post:
      tags: [WhatsApp]
      summary: Webhook para mensajes entrantes de WhatsApp
      responses: { '200': { description: OK } }

  # ───────────── WEBHOOKS (OTA) ─────────────
  /channels/booking/webhook:
    post:
      tags: [Channels]
      summary: Webhook de Booking.com
      responses: { '200': { description: OK } }
  /channels/despegar/webhook:
    post:
      tags: [Channels]
      summary: Webhook de Despegar
      responses: { '200': { description: OK } }

  # ───────────── ADMIN ─────────────
  /admin/audit-logs:
    get:
      tags: [Admin]
      summary: Consultar audit logs
      security: [{ bearerAuth: [] }]
      parameters:
        - name: hotelId
          in: query
          schema: { type: string, format: uuid }
        - name: cursor
          in: query
          schema: { type: string }
      responses: { '200': { description: Audit logs paginados } }

  /admin/system-health:
    get:
      tags: [Admin]
      summary: Estado del sistema
      security: [{ bearerAuth: [] }]
      responses:
        '200':
          content:
            application/json:
              schema:
                type: object
                properties:
                  database: { type: string, enum: [healthy, degraded, down] }
                  redis: { type: string, enum: [healthy, degraded, down] }
                  bullmq: { type: object }
                  lastOTASync: { type: string, format: date-time }

  # ───────────── HEALTH ─────────────
  /health:
    get:
      tags: [System]
      summary: Health check
      responses: { '200': { description: OK } }
```


## 12. Feature Flags (Plan Tiers)

### 12.1 PLAN_FEATURES Configuration

```typescript
// common/constants/plans.ts
export const PLAN_FEATURES: Record<PlanType, PlanFeatures> = {
  free: {
    maxRooms: 5, maxChannels: 1, syncIntervalMinutes: 30,
    whatsapp: true, dynamicPricing: false, promotions: 0,
    apiAccess: false, maxProperties: 1, reports: 'basic',
    maxUsers: 1, support: 'email_72h',
  },
  founders: {
    maxRooms: 9999, maxChannels: 999, syncIntervalMinutes: 0,
    whatsapp: true, dynamicPricing: true, promotions: 999,
    apiAccess: true, maxProperties: 999, reports: 'advanced',
    maxUsers: 999, support: 'prioritario',
  },
  micro: {
    maxRooms: 10, maxChannels: 2, syncIntervalMinutes: 0,
    whatsapp: true, dynamicPricing: false, promotions: 1,
    apiAccess: false, maxProperties: 1, reports: 'basic',
    maxUsers: 2, support: 'whatsapp_48h',
  },
  starter: {
    maxRooms: 20, maxChannels: 3, syncIntervalMinutes: 0,
    whatsapp: true, dynamicPricing: false, promotions: 3,
    apiAccess: false, maxProperties: 1, reports: 'dashboard',
    maxUsers: 3, support: 'whatsapp_24h',
  },
  growth: {
    maxRooms: 50, maxChannels: 5, syncIntervalMinutes: 0,
    whatsapp: true, dynamicPricing: true, promotions: 10,
    apiAccess: true, maxProperties: 3, reports: 'advanced',
    maxUsers: 10, support: 'chat_12h',
  },
  pro: {
    maxRooms: 150, maxChannels: 10, syncIntervalMinutes: 0,
    whatsapp: true, dynamicPricing: true, promotions: 999,
    apiAccess: true, maxProperties: 15, reports: 'forecast',
    maxUsers: 25, support: 'prioritario',
  },
  enterprise: {
    maxRooms: 99999, maxChannels: 999, syncIntervalMinutes: 0,
    whatsapp: true, dynamicPricing: true, promotions: 999,
    apiAccess: true, maxProperties: 999, reports: 'bi_custom',
    maxUsers: 999, support: 'dedicado',
  },
};

interface PlanFeatures {
  maxRooms: number; maxChannels: number; syncIntervalMinutes: number;
  whatsapp: boolean; dynamicPricing: boolean; promotions: number;
  apiAccess: boolean; maxProperties: number; reports: string;
  maxUsers: number; support: string;
}

export function getMinPlanForFeature(feature: string): PlanType {
  const featureHierarchy: Record<string, PlanType> = {
    whatsapp: 'free', roomTypes: 'free', reports: 'free',
    channel2: 'micro', promotions: 'micro',
    channel3: 'starter', dynamicPricing: 'growth',
    apiAccess: 'growth', multiProperty: 'growth',
    channel10: 'pro', forecasting: 'pro',
    unlimited: 'enterprise',
  };
  return featureHierarchy[feature] as PlanType || 'enterprise';
}
```

### 12.2 PlanGuard (Decorator)

```typescript
// decorators/plan.decorator.ts
export const Plan = (...features: string[]) => SetMetadata('plan', features);

// Uso en controlador
@Controller('api/v1/promotions')
export class PromotionsController {
  @Post() @UseGuards(JwtAuthGuard, PlanGuard) @Plan('promotions')
  async createPromotion(@Body() dto: CreatePromotionDto, @CurrentUser() user: JwtPayload) {
    const hotel = await this.hotelService.findById(user.hotelId);
    const activePromos = await this.promotionsService.countActive(hotel.id);
    if (activePromos >= PLAN_FEATURES[hotel.plan].promotions) {
      throw new PlanLimitExceededException('promociones activas', 'growth');
    }
    return this.promotionsService.create(hotel.id, dto);
  }
}
```

### 12.3 Founders Flag y Transición

```typescript
// Feature completa durante 6 meses para hoteles piloto
// Al registrarse como Founder:
// - hotel.isFounder = true
// - hotel.founderExpiresAt = now + 6 meses
// - PlanGuard bypass: si isFounder, todas las features disponibles

// Job semanal: checkea hoteles Founder próximos a expirar
@Processor(QUEUES.NOTIFICATIONS)
export class FounderExpirationProcessor extends WorkerHost {
  async process(job: Job): Promise<void> {
    const expiringSoon = await this.prisma.hotel.findMany({
      where: {
        isFounder: true,
        founderExpiresAt: {
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
          gte: new Date(),
        },
      },
    });

    for (const hotel of expiringSoon) {
      const daysLeft = Math.ceil((hotel.founderExpiresAt!.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      await this.whatsappService.sendText(hotel.id, hotel.phone!, `✨ Tu plan Founders termina en ${daysLeft} días. Elige tu plan: Micro ($80.000/mes), Starter ($160.000/mes), o conserva Free con limitaciones. Responde "Quiero" y te ayudamos.`);
    }

    // Hoteles ya expirados: cambiar a Free
    const expired = await this.prisma.hotel.updateMany({
      where: { isFounder: true, founderExpiresAt: { lte: new Date() } },
      data: { isFounder: false, plan: 'FREE' },
    });
  }
}
```

### 12.4 Sync Interval por Plan

```typescript
// Integrado en ChannelSyncService
async syncToChannels(hotelId: string): Promise<void> {
  const hotel = await this.prisma.hotel.findUnique({ where: { id: hotelId }, select: { plan: true, isFounder: true } });
  const interval = hotel.isFounder ? 0 : PLAN_FEATURES[hotel.plan].syncIntervalMinutes;

  if (interval > 0) {
    // Free: sync cada 30 min via job schedule
    await this.syncQueue.add('sync-free', { hotelId }, { delay: interval * 60 * 1000 });
  } else {
    // Paid: push inmediato
    await this.pushToAllChannels(hotelId);
  }
}
```

---

*Documento generado el 29 de junio de 2026. Fuente de verdad única para todo el desarrollo de la Plataforma B2B Hotelera.*  
*Próxima revisión: Al completar la Fase 1 (MVP).*
