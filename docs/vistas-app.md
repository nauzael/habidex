# 📱 Vistas de la Plataforma Hotelera B2B

> Documento de referencia para Open Design — describe qué contiene cada vista de la app.

---

## Navegación

| Mobile | Desktop |
|---|---|
| Bottom nav: 🏠 📅 💲 📋 ⚙️ | Sidebar izquierda 240px + contenido |

---

## 1. Login / Registro

**Propósito:** El hotelero crea su cuenta o inicia sesión.

**Contiene:**
- Logo + nombre del producto ("HotelManager")
- Tab: Iniciar sesión / Registrarse
- Formulario login: email + contraseña
- Formulario registro: nombre, email, teléfono, nombre del hotel, contraseña
- Botón "Continuar con Google"
- Enlace "¿Olvidaste tu contraseña?"
- Términos y condiciones

**Estados:** loading (spinner), error (campo en rojo), success

---

## 2. Onboarding (Primera vez)

**Propósito:** Guía al hotelero nuevo en 4 pasos swipeables.

**Paso 1 — Bienvenido:** Logo, "Tu hotel en control", "Sin instalar nada, sin complicaciones"
**Paso 2 — Conecta canales:** "Booking.com, Despegar y más. Una sola vez y todo sincroniza"
**Paso 3 — Configura habitaciones:** "¿Cuántas habitaciones tienes?" + stepper numérico
**Paso 4 — ¡Listo!:** Check verde, "Primera notificación: confirma tu email"

**Contiene:** Indicador de progreso (3 dots), botón "Siguiente", botón "Omitir"

---

## 3. Dashboard / Inicio

**Propósito:** Vista principal — Don José ve el estado de su hotel de un vistazo.

**Contiene:**
- **Ocupación hoy** — número grande (84%), verde/amarillo/rojo según %, barra visual de 14 cuadritos
- **ADR** — tarifa promedio ($120.000)
- **RevPAR** — ingreso por habitación ($85.000)
- **Reservas hoy** — contador
- **Check-ins hoy** — contador
- **Gráfico ocupación 7 días** — barras horizontales por día
- **Últimas reservas** — lista de 4: avatar iniciales, nombre, fechas, habitación, monto, canal (Booking/Despegar/Directo), estado
- **FAB +** — botón flotante naranja para acción rápida

**Estados:** loading (skeleton shimmer), empty ("Aún no hay reservas"), error

---

## 4. Calendario / Disponibilidad

**Propósito:** Ver y actualizar disponibilidad de habitaciones por día.

**Contiene:**
- Header: "Disponibilidad" + navegación de mes (◀ Junio 2026 ▶)
- Filtro por tipo de habitación (pills: Todas, Estándar, Premium, Suite)
- Leyenda: 🟢 Verde (>70% libre), 🟡 Amarillo (30-70%), 🔴 Rojo (<30%)
- Grid calendario mensual (7 columnas, 5-6 filas)
  - Cada celda: número de día + disponibilidad (ej: "4/6")
  - Color de celda según ocupación
  - Día actual destacado
- Resumen: "Hoy: 12 disponibles de 14 habitaciones"
- **Modal bottom sheet** al tap en un día:
  - Stepper −/14/+ para ajustar habitaciones disponibles
  - Botones "Cancelar" / "Guardar"

---

## 5. Tarifas

**Propósito:** Gestionar precios de habitaciones por día y temporada.

**Contiene:**
- Header: "Tarifas" + navegación de mes (◀ Junio 2026 ▶)
- Filtro por tipo de habitación (mismo que disponibilidad)
- Leyenda de temporadas: 🔴 Alta, 🟡 Media, 🟢 Baja
- **Botón "Ajuste por temporada →"** — para cambios masivos
- Grid calendario mensual con montos COP en cada celda
  - Cada celda: monto ($120.000) + color de temporada de fondo
- **Modal bottom sheet** al tap en un día:
  - Precio actual destacado
  - Selector de temporada (Alta/Media/Baja)
  - Campo de precio + presets rápidos
  - Checkbox "Aplicar a todos los días de la temporada"
- **Modal de ajuste masivo** (desde botón):
  - Rango de fechas (Desde - Hasta)
  - Selector de temporada
  - Precio base + ajuste porcentual opcional
  - Vista previa: "Se actualizarán 12 días"

---

## 6. Reservas

**Propósito:** Ver, filtrar y gestionar todas las reservas.

**Contiene:**
- Header: "Reservas" + contador total + búsqueda y filtros
- **Filtros rápidos:** Todas, Hoy (3), Este mes (8), Pendientes (2)
- **Lista de reservas** (scroll infinito):
  - Cada item: avatar iniciales, nombre huésped, fechas, habitación, canal (icono), monto, estado (badge)
  - Borde izquierdo de color según estado
- **Badges de estado:** 🟢 Confirmada, 🟡 Pendiente, 🔴 Cancelada
- **Iconos de canal:** 🔵 Booking, 🟢 Despegar, ⚪ Directo, 🔵 Expedia
- **Detalle de reserva** (al tap):
  - Info huésped: nombre, email, teléfono
  - Fechas: check-in, check-out, noches
  - Habitación: número, tipo, camas
  - Canal: nombre + ID de reserva
  - Tarifa: monto
  - Estado: badge
  - Notas (si aplica)
  - Acciones: Modificar, Cancelar (con confirmación), Check-in

**Estados:** loading, empty ("No hay reservas"), error

---

## 7. Perfil / Configuración

**Propósito:** Ver datos del hotel, plan actual, conexiones y ajustes.

**Contiene:**
- **Header:** Foto/logo del hotel, nombre, ubicación, teléfono (tappable)
- **Plan actual:** Badge del plan + botón "Mejorar plan"
- **Conexiones OTA:** Booking, Despegar, Airbnb con estado (✅ / ⏳)
- **WhatsApp:** QR para vincular o estado "Conectado" + número
- **Lista de configuración:** Datos del hotel, Usuarios, Pagos, Facturación, Cerrar sesión

---

## 8. Conexión WhatsApp

**Propósito:** Vincular WhatsApp del hotelero para recibir notificaciones.

**Contiene:**

**Paso 1 — Escanear:**
- Icono WhatsApp grande
- "Recibe notificaciones en WhatsApp"
- Lista de beneficios con checkmarks
- QR grande centrado
- Instrucciones: "Abre WhatsApp > menú > WhatsApp Web > escanea"
- Botón "Ya escaneé el código" (deshabilitado hasta escanear)

**Paso 2 — Verificando:**
- Spinner
- "Conectando con tu WhatsApp..."

**Paso 3 — Conectado:**
- Check verde grande
- Número de teléfono conectado
- Ejemplos de notificaciones que llegará
- Botón "Entendido, ir al Dashboard"

**Paso 4 — Error:**
- X roja
- "No pudimos conectar"
- Botones: Reintentar / Más tarde

---

## Colores de la marca

| Color | Hex |
|---|---|
| Deep Slate (primario) | `#1E2E4A` |
| Slate Medium | `#2E4A7A` |
| Terracota (acento) | `#D47A5A` |
| Sage (éxito) | `#5A8C6F` |
| Amber (advertencia) | `#C49B4A` |
| Soft Red (error) | `#C95A5A` |
| Bg cálido | `#F7F4F0` |
| Texto | `#1C1C2E` |
| Texto secundario | `#6B6B80` |

---

## Prompt consolidado para Open Design

```text
Genera una PWA responsive (mobile-first + desktop) para una plataforma B2B de gestión hotelera en Colombia. El usuario principal es Don José, 58 años, hotelero costeño, usa smartphone Android, baja tecnología.

La app tiene 5 pestañas navegables: Inicio (dashboard), Calendario (disponibilidad), Tarifas, Reservas, Perfil/Config. Además tiene Login, Onboarding (4 pasos) y Conexión WhatsApp como pantallas externas.

Colores:
- Primario: #1E2E4A (deep slate)
- Secundario: #2E4A7A (slate medium)  
- Acento: #D47A5A (terracota)
- Éxito: #5A8C6F (sage)
- Error: #C95A5A
- Fondo: #F7F4F0 (cálido)
- Texto: #1C1C2E
- Texto muted: #6B6B80

Mobile: bottom nav 5 iconos (🏠📅💲📋⚙️)
Desktop: sidebar izquierda 240px (#1E2E4A) + contenido central

Cada vista contiene:

1. LOGIN: Logo + tab login/register + email+password + Google button + forgot password

2. ONBOARDING: 4 pasos swipeables: Bienvenido → Conecta canales → Configura habitaciones → ¡Listo!

3. DASHBOARD: Ocupación hoy (número grande 84% con color dinámico verde/amarillo/rojo), ADR, RevPAR, reservas hoy, check-ins hoy, gráfico de barras 7 días, últimas reservas (avatar+nombre+fechas+monto+canal+estado), FAB botón + flotante

4. CALENDARIO: Grid mensual 7 columnas, celdas con color según ocupación (verde>70%, amarillo 30-70%, rojo<30%) y disponibilidad "4/6", filtro por tipo habitación (pills), modal al tap con stepper −/+/número

5. TARIFAS: Grid mensual con montos COP en cada celda, color de temporada (rojo alta, amarillo media, verde baja), botón ajuste masivo por temporada, modal edición precio con selector temporada + presets + checkbox aplicar a todos

6. RESERVAS: Lista scroll infinito con filtros (Todas/Hoy/Este mes/Pendientes), cada item: avatar+nombre+fechas+hab+canal+estado. Detalle al tap con info completa + acciones (modificar/cancelar/check-in)

7. PERFIL: Foto hotel + info + plan actual + botón mejorar + conexiones OTA con estado + QR WhatsApp + settings list

8. WHATSAPP: QR linking flow (escanear → verificando → conectado → error), beneficios, ejemplos de notificaciones

Tipografía: sistema (SF Pro/Roboto), base 16px, español colombiano
Moneda: formato $80.000 COP
Fechas: DD/MM/YYYY
Touch targets: mínimo 48×48px
Idioma: Español colombiano
```