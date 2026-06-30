# 🏝️ Plan de Ejecución: Plataforma B2B Hotelera

**Versión:** 3.1 — Consolidado (precios en COP)  
**Fecha:** 29 de junio de 2026  
**Mercado inicial:** Golfo de Morrosquillo (Tolú, Coveñas, San Antero) y Sucre, Colombia  
**Expansión:** Costa Caribe → Colombia → LATAM  
**💵 Precios en pesos colombianos (COP)** — tasa referencial $4,100/USD  
**Nota:** Costos de infraestructura cloud (Fly.io, AWS, Render) y montos de inversión se mantienen en USD por ser gastos internacionales.

---

## 📋 Índice

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Decisiones Clave del Proyecto](#2-decisiones-clave-del-proyecto)
3. [Análisis del Sector](#3-análisis-del-sector)
4. [Funcionalidades Core](#4-funcionalidades-core)
5. [Modelo de Negocio](#5-modelo-de-negocio)
6. [Plan de Hosting (3 Capas)](#6-plan-de-hosting-3-capas)
7. [Roadmap Técnico](#7-roadmap-técnico)
8. [Estrategia de Mercado](#8-estrategia-de-mercado)
9. [Plan Financiero](#9-plan-financiero)
10. [Cola de Tareas por Fase](#10-cola-de-tareas-por-fase)
11. [Próximos Pasos](#11-próximos-pasos)

---

## 1. Resumen Ejecutivo

### Visión

Plataforma **SaaS B2B** que unifica Channel Manager + Revenue Management en una sola solución para hoteles independientes y cadenas pequeñas, comenzando en la Costa Caribe colombiana.

### Problema

Hoteles independientes gestionan manualmente disponibilidad en 2-6 OTAs (Booking, Expedia, Despegar) causando overbooking recurrente, revenue leakage, y horas perdidas en Excel.

### Propuesta de Valor

| Diferenciador | Descripción |
|---|---|
| **Diseñado para el hotelero costeño** | OTAs regionales, pagos locales (Nequi, Efecty, PSE), facturación DIAN, interfaz en español |
| **Pricing ultra-accesible** | Plan Free permanente + pagos desde **$80.000/mes**. Sin sorpresas ni costos variables |
| **PWA mobile-first** | App en el celular sin instalar. Modo offline para playas sin internet |
| **WhatsApp nativo** | Notificaciones de reservas y alertas vía WhatsApp — el canal que usan los hoteleros |
| **Pooled Inventory** | Sincronización en tiempo real, cero overbookings |

### Mercado

- **Inmediato:** ~200-400 alojamientos en Golfo de Morrosquillo + Sucre
- **Colombia:** ~8,000 hoteles independientes (10-150 hab.)
- **LATAM:** ~48,000 hoteles independientes
- **Meta Año 1:** 30-80 hoteles activos

### Modelo de Negocio Resumido

Suscripción mensual fija (sin pausas por temporada) + comisión 1% por reserva + add-ons premium.

> 💵 **Todos los precios de planes en COP.** A tasa ~$4,100/USD. Costos de infraestructura e inversión en USD.

---

## 2. Decisiones Clave del Proyecto

Estas son las decisiones tomadas durante la definición del plan:

| Decisión | Opción elegida | Alternativa descartada | Razón |
|---|---|---|---|
| **Foco geográfico inicial** | Golfo de Morrosquillo + Sucre | LATAM genérico | Concentrar recursos donde no hay competencia. Mercado desatendido |
| **Plan Free** | Permanente, sin expiración (hasta 5 hab, 1 canal) | Trial 30 días | Elimina barrera de entrada. ~40% migran a pago en 12 meses |
| **Suscripción** | Precio fijo todo el año | Pausa en temporada baja | El hotelero paga lo mismo siempre. Sin gestión de ciclos de pago |
| **Estrategia OTA pre-certificación** | Affiliate API (verificación) + WhatsApp + CSV export | Scraping | Scraping viola términos de servicio y puede banear al hotelero |
| **Hosting MVP** | Fly.io + Neon (Postgres) + Upstash (Redis) | Oracle Cloud, Vercel+D1, VPS | Equilibrio entre $0, no duerme, y migración directa a producción |
| **PWA vs App nativa** | PWA (Service Worker + IndexedDB) | App nativa Android/iOS | Los hoteleros no instalan apps. PWA ocupa <5MB, funciona offline |
| **Stack backend** | Node.js + NestJS + TypeScript | Python/FastAPI, Java/Spring | Pool de talento LATAM, I/O intensivo (APIs + webhooks + sync) |
| **Stack frontend** | React + Next.js + Tailwind | Vue/Nuxt, Angular | SSR para dashboards, ecosistema masivo, PWA nativa |
| **Base de datos** | PostgreSQL + Redis (MVP). TimescaleDB en Capa 2+ | MySQL, MongoDB | ACID para bookings, time-series en Fase 2 |
| **Pagos locales** | Nequi + PSE + Efecty + Stripe | Solo Stripe | La mayoría de hoteleros no tiene tarjeta de crédito internacional |

---

## 3. Análisis del Sector

### 3.1 Tendencias

| Tendencia | Impacto |
|---|---|
| **Direct Connect** — Cadenas grandes conectan directo con OTAs | Oportunidad: democratizar Direct Connect para independientes vía nuestra plataforma |
| **De-techadorización** — Hoteles migran de PMS legacy a cloud | Oportunidad: la plataforma reemplaza PMS obsoleto con channel manager integrado |
| **Consolidación OTAs** — Booking + Expedia controlan >60% del mercado | Riesgo mitigable integrando OTAs regionales (Despegar, PriceTravel) + metasearch |
| **IA en Revenue Management** — SiteMinder iQ, Cloudbeds Signals, Mews RMS | Oportunidad: incorporar Revenue AI en Fase 3 con datos de la red |
| **ChatGPT como canal de distribución** — SiteMinder ya conecta hoteles a ChatGPT vía MCP | Oportunidad futura: ser el channel manager que conecte hoteles LATAM a AI agents |

### 3.2 Competencia

| Competidor | Fortaleza | Debilidad | Nuestra ventana |
|---|---|---|---|
| **SiteMinder** | 53K propiedades, 490+ canales, 20 años de data | Caro ($99+/mes), sin revenue management integrado, soporte LATAM limitado | Precio 50% menor, revenue integrado, soporte nativo LATAM |
| **Cloudbeds** | PMS + Channel Manager unificado, Signals AI | Desde ~$100/mes, orientado US/EU, sin foco LATAM | Channel Manager + Revenue a menor precio, especialización LATAM |
| **Mews** | Mejor PMS 2024-2026, API-first, UX moderna | No es channel manager puro, mínimo 8 integraciones | Somos complemento: nos integramos con Mews como capa de distribución |
| **Despegar** | Dominio regional LATAM | Es OTA, compite con el hotel por margen, no ofrece channel management | Somos aliados del hotel, integramos Despegar como un canal más |

### 3.3 Oportunidad Regional

| Nicho | Tamaño | Oportunidad |
|---|---|---|
| **Hoteles boutique 5-30 hab. Costa Caribe** | ~400-600 en Sucre/Córdoba/Bolívar | Sin channel manager local. Plan Micro ($19/mes) diseñado para ellos |
| **Cadenas locales pequeñas (2-10 propiedades)** | ~3,000 grupos en LATAM | Multi-propiedad desde Growth ($99/mes). Competidores cobran por propiedad |
| **Mercado LATAM sin penetración** | 50% de hoteles aún sin channel manager | Oportunidad de ser el primero en llevar channel management a hoteles independientes de la región |

---

## 4. Funcionalidades Core

### 4.1 Sistema de Disponibilidad en Tiempo Real

| Funcionalidad | Detalle | SLA |
|---|---|---|
| **Pooled Inventory** | Inventario centralizado en PostgreSQL, propagación a todos los canales | <5s |
| **Control de Concurrencia** | Optimistic locking + PostgreSQL SERIALIZABLE | 0 overbookings |
| **Caché de Disponibilidad** | Redis multinivel + Edge caching (CloudFront) | <100ms p99 |
| **Webhooks OTA** | Recepción de notificaciones post-reserva con HMAC + idempotency key | <1s |
| **Reconciliation Job** | Compara inventario local vs OTA cada 5 min. Alerta si hay discrepancia | ≤5 min |
| **Restricciones** | MLOS, CTA, CTD, Stop Sell por fecha y tipo de habitación | — |

### 4.2 Gestión de Tarifas

| Funcionalidad | Detalle |
|---|---|
| **Rate Plans** | BAR, tarifas derivadas, tarifas por canal, promocionales |
| **Pricing Dinámico** | Reglas por estacionalidad, día de semana, anticipación, ocupación. ML en Fase 3 |
| **Rate Parity** | Monitoreo de tarifas en cada OTA vs configuradas. Alertas de disparidad |
| **Floor Price** | Precio mínimo que ninguna regla puede atravesar. Protege al hotel |
| **Calendario de Temporadas** | Alta (Dic-Ene, Semana Santa, Jun-Jul), Media, Baja. Overrides manuales |

### 4.3 Promociones y Ofertas

Motor de reglas: descuento %, monto fijo, noches gratis, early bird, last minute, paquetes, no reembolsable. Stacking controlado con validación de margen mínimo.

### 4.4 APIs para Terceros

REST API con OAuth2, rate limiting por tier, sandbox, webhooks, OpenAPI 3.0.

### 4.5 Reportes y Analítica

Dashboards: ocupación, ADR, RevPAR, channel mix. Forecasting 30/60/90 días. Alertas configurables. Competitive benchmarking anonimizado.

### 4.6 Consideraciones de Conectividad

| Funcionalidad | Prioridad |
|---|---|
| **PWA (Progressive Web App)** | Crítica — Obligatoria desde MVP |
| **Modo Offline Ligero** | Crítica — Consultar/actualizar sin internet, sincroniza al reconectar |
| **WhatsApp (OpenWA)** | Crítica — Notificaciones transaccionales. Self-hosted, $0. Adapter para migrar a Business API oficial (FUT-01) |
| **UI Mobile-First** | Crítica — Diseñada para Android gama media |
| **Optimización Redes Lentas** | Alta — Compresión Brotli, assets WebP, code splitting |

---

## 5. Modelo de Negocio

### 5.1 Perfiles de Usuario

| Persona | Pain Point | Plan target |
|---|---|---|
| **Don José — Hotelero de Tolú** (dueño, 58 años, 20 hab., WhatsApp + Excel) | Overbooking en temporada alta, pierde 2-3h/día actualizando tarifas | Free → Micro ($19) → Starter ($39) |
| **Carlos — Revenue Manager** (8 hoteles, Cartagena/Santa Marta, PMS legacy) | Tarifas fijas todo el año, sin visibilidad multi-propiedad | Growth ($99) → Pro ($199) |
| **Andrea — Agencia de Viajes B2B** (Medellín, paquetes a hoteles de playa) | Llamar a cada hotel para cotizar | API pública (Fase 3) |

### 5.2 Planes y Precios

> 👑 **Tier Founders (Piloto):** Los primeros 10 hoteles beta en Tolú y Coveñas reciben **funcionalidad COMPLETA durante 6 meses** — todos los canales, tiempo real, WhatsApp, pricing dinámico, todo. Sin limitaciones. A cambio, dan feedback semanal, participan en entrevistas, y autorizan uso de datos anonimizados.  
> Después de los 6 meses, eligen si se quedan en un plan pago con descuento vitalicio (precio congelado) o vuelven al Free estándar (con limitaciones).

| Característica | Free | Micro | Starter | Growth | Pro | Enterprise |
|---|---|---|---|---|---|---|---|
| **Precio / mes** | **Gratis** | **$80.000** | **$160.000** | **$400.000** | **$800.000** | **$1.600.000+** |
| **Habitaciones** | Hasta 5 | Hasta 10 | Hasta 20 | Hasta 50 | Hasta 150 | Ilimitadas |
| **Canales OTA** | 1 | 2 | 3 | 5 | 10 | Ilimitados |
| **Pooled Inventory** | Cada 30 min | Tiempo real | Tiempo real | Tiempo real | Tiempo real | Tiempo real |
| **WhatsApp (OpenWA)** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Pricing Dinámico** | ✗ | ✗ | ✗ | Reglas | ML | ML + custom |
| **Promociones** | ✗ | 1 activa | 3 activas | 10 activas | Ilimitadas | Ilimitadas |
| **API Pública** | ✗ | ✗ | ✗ | 1K req/mes | 10K req/mes | Custom |
| **Multi-propiedad** | ✗ | ✗ | ✗ | Hasta 3 | Hasta 15 | Ilimitadas |
| **Reportes** | Ocupación básica | Básicos | Dashboards | Avanzados | Forecast + Alertas | BI + Custom |
| **Soporte** | Email 72h | WhatsApp 48h | WhatsApp 24h | Chat 12h | Prioritario | Dedicado |
| **Duración** | Ilimitada | Mensual/Anual | Mensual/Anual | Mensual/Anual | Mensual/Anual | Contrato |

### 5.3 Estrategia del Plan Free y Tier Founders

**Plan Free (público):** Puerta de entrada para cualquier hotelero. Sin expiración. Incluye WhatsApp y funcionalidades básicas, con limitaciones estratégicas en canales (1 OTA) y velocidad de sincronización (cada 30 min). ~40% migran a pago en 12 meses cuando necesitan más canales o tiempo real.

**Tier Founders (piloto exclusivo):** Los primeros 10 hoteles beta obtienen acceso completo a TODAS las funcionalidades — sin restricciones de canales, sincronización en tiempo real, WhatsApp, pricing dinámico, promociones ilimitadas. Es la zanahoria para atraer los mejores hoteles beta y obtener feedback de calidad sobre el producto completo, no sobre una versión limitada.

**Camino de upgrade natural (para el público general):**
```
Free (5 hab, 1 canal, sync 30 min)
  ↓ "Quiero conectar Booking Y Despegar"
Micro $80.000/mes (10 hab, 2 canales, WhatsApp)
  ↓ "Estoy creciendo, necesito más canales"
Starter $160.000/mes (20 hab, 3 canales, promos)
  ↓ "Quiero pricing automático para temporada alta"
Growth $400.000/mes (50 hab, 5 canales, pricing por reglas)
  ↓ "Tengo varias propiedades"
Pro $800.000/mes (150 hab, 10 canales, ML + forecast)
```

**Gatillos de conversión:** Sync cada 30 min (vs tiempo real) → dolor en temporada alta. 1 solo canal OTA → límite de distribución competitiva. Sin promociones ni pricing automático → pérdida de revenue.

**Conversión esperada:** 5-10% a los 3 meses, 25-35% a los 12 meses, 40-50%+ a los 24 meses.

### 5.4 Comisiones y Add-ons

| Concepto | Pricing (COP) |
|---|---|
| **Comisión por reserva** | 1% (Micro/Starter), 1.5% (Growth), 2% (Pro), 2.5% (Enterprise) |
| **Revenue Management AI** | +$160.000/mes (Growth), +$400.000/mes (Pro y Enterprise) |
| **Competitive Benchmarking** | +$200.000/mes (Growth), +$320.000/mes (Pro/Enterprise) |
| **GDS (Amadeus, Sabre)** | +$800.000/mes (Enterprise), Fase 4 |
| **White-label** | $4.100.000 setup + $800.000/mes |

### 5.5 Métodos de Pago Locales

| Método | Tipo | Comisión plataforma |
|---|---|---|
| **Nequi** | Billetera digital | 0.5-1% |
| **Daviplata** | Billetera digital | 0.5-1% |
| **PSE** | Débito bancario | 0.8-1.2% |
| **Efecty / Baloto** | Efectivo | 2-3% |
| **Stripe** | Tarjeta internacional | 2.9% + $0.30 |

### 5.6 Métricas Clave

| Métrica | Año 1 | Año 2 | Año 3 |
|---|---|---|---|
| **Hoteles activos** | 30-80 | 200-400 | 800-1,200 |
| **CAC** | $1.600K-3.200K | $1.000K-2.000K | $600K-1.600K |
| **LTV** | $9.800K | $19.700K | $34.400K |
| **MRR** | $12M-33M | $62M-144M | $246M-492M |
| **ARR** | $148M-394M | $738M-1.722M | $2.950M-5.900M |
| **Churn mensual** | <5% | <3% | <2% |
| **Breakeven** | No | Mes 24-30 | ✓ |
| **Gross Margin** | 55-65% | 65-75% | 75-85% |

---

## 6. Plan de Hosting (3 Capas)

> **Principio:** El mismo Dockerfile, el mismo código, la misma base de datos PostgreSQL. Solo cambian las variables de entorno.

### 🟢 CAPA 1: MVP ($0-5/mes)

| Componente | Producto | Costo | Detalle |
|---|---|---|---|
| **API (NestJS)** | Fly.io | ~$0/mes (crédito $5-10) | 1 VM compartida 256MB, **no duerme nunca** |
| **Frontend (Next.js)** | Fly.io | Incluido | Mismo deploy que la API |
| **Base de datos** | Neon (serverless Postgres) | $0/mes | 0.5GB, compute siempre activo |
| **Redis** | Upstash | $0/mes | 10MB, serverless |
| **CDN + DNS** | Cloudflare | $0/mes | DNS, CDN, DDoS protection |
| **CI/CD** | GitHub Actions | $0/mes | 2,000 min/mes |

**Total: $0-2/mes** — Primeros meses gratis con crédito Fly.io.

> ⚠️ **Estrategia de memoria MVP:** Fly.io 256MB se agota con NestJS + Next.js SSR juntos (~170-515MB). Solución: Next.js con **static export** (`output: 'export'`) — la PWA se sirve desde CDN (Cloudflare), sin SSR. Solo el API NestJS corre en la VM. Consumo real: ~120-180MB bajo carga, cabe en 256MB. Si es necesario, escalar a 512MB ($2.50/mes).

**¿Por qué no Render?** Render duerme el servicio gratis a los 15 min de inactividad. Un hotelero abriendo la app a las 6 AM esperaría 30 segundos a que despierte. Inaceptable.

### 🟡 CAPA 2: Producción Temprana ($19-50/mes)

| Componente | Producto | Costo | Migración |
|---|---|---|---|
| **API + Frontend** | Render Web Service (Pro) | $7-15/mes | Mismo código, deploy desde GitHub |
| **Base de datos** | Render PostgreSQL | $7-15/mes | `pg_dump` desde Neon → `pg_restore` a Render |
| **Redis** | Upstash Pro | $5-10/mes | Misma API |
| **CDN** | Cloudflare (sigue igual) | $0/mes | Sin cambios |

**Migración desde MVP (10 min):**
```bash
pg_dump --no-owner -h neon.url -U user db > backup.sql
psql -h render.url -U user db < backup.sql
# Cambiar DATABASE_URL en Render → Deploy automático
```

### 🔴 CAPA 3: Producción Definitiva ($200-500/mes)

| Componente | Producto | Costo | Cuándo |
|---|---|---|---|
| **API** | AWS ECS Fargate | $80-200/mes | >200 hoteles |
| **PostgreSQL** | AWS RDS Multi-AZ | $50-150/mes | >500 hoteles |
| **Redis** | AWS ElastiCache | $20-50/mes | >200 hoteles |
| **CDN** | CloudFront | $10-30/mes | Tráfico significativo |
| **Archivos** | AWS S3 | $5-20/mes | Fotos de hoteles |
| **Balanceador** | ALB | $20-25/mes | Múltiples instancias |

**Migración desde Render:** Mismas imágenes Docker. AWS DMS para migración de BD con cero downtime.

### Lo que NO usar

| Opción | Problema |
|---|---|
| **Oracle Cloud Always Free** | 80% rechazo al registrarse. Migrar después implica rehacer infra |
| **Vercel + Supabase** | Vercel no corre NestJS server. Migrar = reescribir backend |
| **Cloudflare Workers + D1** | SQLite vs PostgreSQL. Stack incompatible |
| **VPS (DigitalOcean, Linode)** | No hay tier gratis. Configuración manual de todo |

---

## 7. Roadmap Técnico

### 7.1 Stack Tecnológico (corregido tras revisión de arquitectura)

> ⚠️ **Corregido en v3.2:** Kafka+RabbitMQ+Debezium+Kong+Database-per-tenant eliminados del MVP. BullMQ, RLS y NestJS middleware reemplazan. Ver `plan.yaml` WAVE 0.

| Capa | Tecnología | Versión | Justificación |
|---|---|---|---|
| **Backend** | Node.js + NestJS + TypeScript | 22 LTS / 10 / 5.5+ | Pool talento LATAM, I/O intensivo, type safety |
| **ORM** | Prisma | 6.x | Type-safe, migraciones, multi-provider |
| **Frontend** | React + Next.js + Tailwind | 19 / 15 / 4 | PWA nativa, ecosistema masivo, static export para MVP |
| **Base de datos** | PostgreSQL (Neon serverless MVP → Render/AWS después) | 16 | ACID para bookings, RLS para multi-tenancy |
| **Métricas time-series** | PostgreSQL (materialized views + aggregates) | — | TimescaleDB no es compatible con Neon. Reintroducir en Capa 2 |
| **Caché** | Redis (Upstash) | 7.x | <100ms disponibilidad, rate limiting, locks, colas |
| **Colas asíncronas** | BullMQ (basado en Redis) | 5.x | Jobs, retries, DLQ. Reemplaza Kafka+RabbitMQ en MVP |
| **Auth** | NestJS JWT + Passport (nativo) | — | bcrypt + JWT + RBAC. Keycloak se introduce en Fase 3 si se necesita SSO/OIDC |
| **Email** | Resend (transaccional) | — | Bienvenida, password reset, facturas |
| **Logging** | Pino (structured JSON) | — | Correlation IDs, niveles, rotación |
| **Monitoreo** | Health endpoint + Sentry (errores) | — | Grafana+Prometheus diferidos a Fase 2 |
| **Notificaciones** | WhatsApp vía **OpenWA** (self-hosted, $0) | — | Adapter listo para migrar a Business API oficial (FUT-01) |
| **IaC** | Configuración manual (fly.toml + UI) | — | Terraform diferido a Capa 2 |
| **CI/CD** | GitHub Actions | — | 2,000 min/mes gratis |

### 7.2 Arquitectura (corregida — Modular Monolith)

**Estrategia:** Modular Monolith (Fase 1-2) → Microservicios (Fase 3+).

```
(Un solo proceso NestJS, sin Kong ni Kafka)
  ├── Availability Module ─── schema PostgreSQL con RLS (tenant_id)
  ├── Rate Module ─────────── schema PostgreSQL con RLS (tenant_id)
  ├── Booking Module ──────── schema PostgreSQL con RLS (tenant_id)
  ├── Channel Sync ────────── BullMQ jobs + adapters por OTA
  ├── Promotion Engine ────── reglas + calendario de temporadas
  ├── Auth Module ─────────── NestJS JWT + Passport + PlanGuard
  ├── WhatsApp Module ─────── OpenWA adapter (FUT-01: Business API)
  ├── Analytics Module ────── materialized views (TimescaleDB en Capa 2+)
  └── Audit Module ────────── interceptor NestJS + Pino structured logs
```

**Principios corregidos:**
- **Bounded Contexts desde día 1** — Cada módulo NestJS con su propio schema lógico
- **RLS con tenant_id** — Reemplaza database-per-tenant para MVP. Transicionar si >500 hoteles
- **BullMQ para tareas asíncronas** — Reemplaza Kafka+RabbitMQ+Debezium para MVP
- **NestJS middleware** — Rate limiting, guards, validation. Reemplaza Kong
- **Optimistic Locking** — `version` column en Inventory/Rate tables
- **Transactional Outbox simplificado** — Polling query cada 5s + BullMQ job

### 7.3 Estrategia de Certificación OTA

| OTA | Protocolo | Timeline | Estrategia puente (pre-certificación) |
|---|---|---|---|
| **Booking.com** | B.XML + OTA XML + REST | 3-6 meses | **Demand API (Affiliate)** para consultar disponibilidad + WhatsApp recordatorios + CSV export |
| **Expedia Group** | GraphQL Connectivity Hub | 3-6 meses | WhatsApp recordatorios + CSV export + reporte diario de pendientes |
| **Despegar** | Partner API (portal cerrado) | 2-4 meses | WhatsApp recordatorios + CSV export. Contactar partnerships día 1 |
| **Airbnb** | REST Partner API | 1-2 meses | Más simple. Priorizar después de las tres principales |

**Mecanismo puente (funciona desde el MVP):**
```
Hotelero marca habitación OCUPADA en nuestra app
       │
       ▼
Plataforma:
  ├── Guarda en BD local
  ├── Envía WhatsApp: "✅ Reservada. Recordatorio: cerrar en Booking.com y Despegar"
  └── Consulta Demand API de Booking: ¿sigue disponible?
       │
       ▼
Si Booking aún la muestra disponible → nuevo WhatsApp cada 2h hasta que confirme
Si Booking ya no la muestra → "✅ Booking actualizado correctamente"
       │
       ▼
Reporte semanal: "% de cumplimiento de actualizaciones manuales"
```

Cuando llegue la certificación, el push automático reemplaza al flujo manual **sin que el hotelero note el cambio**.

---

## 8. Estrategia de Mercado

### 8.1 Go-to-Market por Fases

| Fase | Timeline | Objetivo | Actividades clave |
|---|---|---|---|
| **Fase 0: Beta** | M1-3 post-MVP | 10 hoteles en Tolú/Coveñas | Onboarding presencial, feedback semanal, 6 meses gratis |
| **Fase 1: Golfo** | M4-12 | 30-80 hoteles | BDR en Sincelejo, alianzas alcaldías, radio local, WhatsApp |
| **Fase 2: Caribe** | M13-24 | 200-400 hoteles | Oficina Cartagena, COTELCO, ANATO, marketing digital |
| **Fase 3: Colombia** | M25-36 | 800-1,200 hoteles | Cobertura nacional, API pública, partnerships corporativos |
| **Fase 4: LATAM** | M37+ | Primeros pasos fuera Colombia | Panamá, Costa Rica, México, Perú, Brasil |

### 8.2 Canales de Captación (Costa Caribe)

| Canal | Inversión | Descripción |
|---|---|---|
| **Alianzas alcaldías** | $0 | Oficinas de turismo de Tolú, Coveñas, Sincelejo |
| **WhatsApp Business** | $500-1K/mes | Contenido educativo, comunidad de hoteleros |
| **Radio local** | $300-800/mes | Olímpica Stereo, emisoras comunitarias |
| **Visitas puerta a puerta** | $1-2K/mes | BDR recorre la playa visitando hoteles uno por uno |
| **Ferias regionales** | $500-1K/evento | Feria de Turismo Sincelejo, Vitrina ANATO |
| **Influencers turísticos** | $200-500/post | Creadores colombianos en Instagram/TikTok |
| **Programa de referidos** | $0 (descuentos) | "Trae un amigo hotelero" — 1 mes gratis para ambos |

### 8.3 Content Marketing

Pilares: Revenue Management para hoteles de playa, Channel Management para principiantes, Digitalización del hotel costeño, Casos de éxito locales. SEO en español colombiano.

---

## 9. Plan Financiero

### 9.1 Inversión Total (24 meses)

| Concepto | Fase 1 (M1-6) | Fase 2 (M7-12) | Fase 3 (M13-18) | Fase 4 (M19-24) | Total |
|---|---|---|---|---|---|
| **Personal** | $280-380K | $380-500K | $510-680K | $630-840K | $1.80M-2.40M |
| **Infraestructura** | $18-30K | $30-48K | $48-72K | $72-108K | $168-258K |
| **SaaS + APIs** | $7-15K | $15-24K | $24-34K | $34-45K | $80-118K |
| **Marketing GTM** | $10-20K | $20-40K | $40-80K | $80-120K | $150-260K |
| **Otros** | $45-55K | $25-30K | $20-30K | $20-30K | $110-145K |
| **Total por fase** | $360-500K | $470-642K | $642-896K | $836K-1.14M | **$2.3M-3.2M** |

### 9.2 Proyección de Revenue

| Año | Hoteles | Geografía | ARR | Revenue Total |
|---|---|---|---|---|
| **Año 1** | 30-80 | Golfo Morrosquillo + Sincelejo | $36-96K | $48-126K |
| **Año 2** | 200-400 | Costa Caribe colombiana | $180-420K | $250-590K |
| **Año 3** | 800-1,200 | Colombia | $720K-1.44M | $1.0M-2.0M |

### 9.3 Breakeven

| Escenario | Mes | Inversión acumulada |
|---|---|---|
| Optimista | 22 | ~$1.8M |
| **Base** | **26** | **~$2.4M** |
| Conservador | 30 | ~$3.1M |

### 9.4 KPIs de Éxito

| KPI | Año 1 | Año 2 | Año 3 |
|---|---|---|---|
| **MRR Growth** | 15-25% mensual | 10-15% mensual | 8-10% mensual |
| **NRR** | >100% | >110% | >115% |
| **CAC** | <$600 | <$400 | <$300 |
| **LTV/CAC** | >4x | >6x | >10x |
| **Churn** | <5% | <3% | <2% |
| **NPS** | >30 | >40 | >50 |
| **Time to Onboard** | <7 días | <3 días | <1 día |
| **Overbooking incidents** | 0% | 0% | 0% |
| **OTA Sync Latency** | <5s p99 | <3s p99 | <2s p99 |

---

## 10. Cola de Tareas por Fase

### 🔴 Bloque Inmediato: Plan Free (Pre-MVP)

| ID | Tarea | Prioridad | Dependencia |
|---|---|---|---|
| **FREE-01** | Feature flags para tiers (Free/Micro/Starter/Growth/Pro/Enterprise) | Crítica | — |
| **FREE-02** | Sync cada 30 min para Free vs tiempo real para pagos | Crítica | FREE-01 |
| **FREE-03** | UI del dashboard Free: features bloqueadas en gris con tooltip de upgrade | Crítica | FREE-01 |
| **FREE-04** | Flujo de upgrade en 1 clic: Free → Micro (preservar datos, cero fricción) | Crítica | FREE-03 |
| **FREE-05** | Crear tier **Founders** con flag de funcionalidad completa para hoteles piloto | Crítica | FREE-01 |
| **FREE-06** | Pasarela de pago local: Nequi + PSE + Efecty | Alta | FREE-04 |
| **FREE-07** | Analytics: tracking de conversión Free → Pago (embudo) | Media | FREE-04 |

### 🟡 Fase 1: MVP Core (Meses 1-6)

| ID | Tarea | Prioridad | Dependencia |
|---|---|---|---|
| **MVP-01** | Data model: Hotel, RoomType, Inventory, Rate, Booking (PostgreSQL) | Crítica | — |
| **MVP-02** | Pooled inventory con optimistic locking + Redis cache | Crítica | MVP-01 |
| **MVP-03** | Conexión OTA #1: Booking.com (iniciar certificación + Demand API puente) | Crítica | MVP-02 |
| **MVP-04** | Conexión OTA #2: Despegar (contactar partnerships + puente manual) | Crítica | MVP-03 |
| **MVP-05** | PWA mobile-first con modo offline (Service Worker + IndexedDB) | Crítica | — |
| **MVP-06** | Dashboard básico: ocupación, revenue, channel mix | Alta | MVP-02 |
| **MVP-07** | Rate plans base + calendario de temporadas | Alta | MVP-01 |
| **MVP-08** | WhatsApp Business API: notificaciones de reserva | Alta | — |
| **MVP-09** | Implementar flujo puente OTA: WhatsApp + Demand API verificación + CSV | Alta | MVP-08 |
| **MVP-10** | Onboarding self-service con videos en español | Media | MVP-05 |
| **MVP-11** | Beta cerrada: 10 hoteles en Tolú y Coveñas | Crítica | MVP-05, MVP-03, MVP-04 |

### 🟢 Fase 2: Pricing & Crecimiento (Meses 7-12)

| ID | Tarea | Prioridad | Dependencia |
|---|---|---|---|
| **PRC-01** | Motor de pricing dinámico basado en reglas | Crítica | MVP-07 |
| **PRC-02** | Conexiones OTA push: Booking certificado, Expedia, Airbnb, PriceTravel | Alta | MVP-03 |
| **PRC-03** | Forecasting 30/60/90 días (modelo estadístico) | Media | MVP-06 |
| **PRC-04** | Expansión geográfica: Golfo de Morrosquillo completo + Sincelejo | Alta | MVP-11 |

### 🔵 Fase 3: Revenue AI + Plataforma Abierta (Meses 13-18)

| ID | Tarea | Prioridad |
|---|---|---|
| **AI-01** | Revenue Management AI: ML con datos acumulados de la red | Alta |
| **AI-02** | API pública con OAuth2 + rate limiting | Alta |
| **AI-03** | Integraciones PMS: Cloudbeds, Mews, Zeus | Media |
| **AI-04** | Multi-propiedad: dashboard consolidado para cadenas | Media |
| **AI-05** | Expansión: Costa Caribe colombiana | Alta |

### ⚪ Backlog (Post-Fase 3)

| ID | Tarea |
|---|---|
| **BL-01** | GDS: Amadeus, Sabre |
| **BL-02** | White-label para cadenas y agencias |
| **BL-03** | Multi-región: AWS sa-east-1 (DR) |
| **BL-04** | Expansión LATAM: Panamá, Costa Rica, México |
| **BL-05** | Expansión SEA/África |

---

## 11. Próximos Pasos

1. **Día 1:** Iniciar proceso de partnership con Booking.com Connectivity (no requiere producto terminado)
2. **Día 1:** Contactar equipo de partnerships de Despegar
3. **Semana 1:** Registrar Fly.io + Neon + Upstash. Configurar CI/CD
4. **Semana 1:** Definir MVP scope MoSCoW (incluir PWA + offline + WhatsApp)
5. **Semana 2:** Iniciar desarrollo del core data model (PostgreSQL schema)
6. **Mes 1:** Tener PWA shell funcional con Service Worker + IndexedDB
7. **Mes 2:** Tener pooled inventory funcional con Redis cache
8. **Mes 2:** Tener flujo puente: WhatsApp recordatorios + Demand API verificación
9. **Mes 3:** Primer deploy en Fly.io con 3 hoteles reales en Tolú
10. **Mes 3-5:** Beta con 10 hoteles en Tolú y Coveñas
11. **Mes 6:** Launch MVP + Plan Free. Iniciar captación en Golfo de Morrosquillo

---

*Documento consolidado — 27 de junio de 2026.*  
*Reemplaza a: plan-integral-b2b-hotelero.md, tareas-b2b-hotelero.md, hosting-recomendacion.md*  
*Próxima revisión: Al completar la Fase 1 (MVP)*
