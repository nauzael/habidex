# 🎨 Prompts de UI para Open Design

> Generados el 29 de junio de 2026
> Plataforma B2B Hotelera — Golfo de Morrosquillo
> Perfil de usuario: Don José, 58 años, hotelero costeño, smartphone Android, baja tecnología
> App: PWA responsive — mobile-first, adaptativa a desktop

---

## 🎨 Paleta de Colores (Actualizada)

Colores modernos, profesionales, con calidez. Inspirados en diseño B2B actual.

### Colores primarios
| Color | Hex | Uso |
|---|---|---|
| **Deep Slate** | `#1E2E4A` | Primario — barras, botones principales, headers |
| **Slate Medium** | `#2E4A7A` | Hover, variante clara del primario |
| **Slate Light** | `#4A6B9A` | Elementos secundarios, bordes |

### Colores de acento
| Color | Hex | Uso |
|---|---|---|
| **Terracota** | `#D47A5A` | **Acento principal** — CTA, badges, elementos destacados |
| **Terracota Light** | `#E8947A` | Hover, variante clara |
| **Terracota Pale** | `#FDF0EA` | Fondos sutiles de acento |

### Colores funcionales
| Color | Hex | Uso |
|---|---|---|
| **Sage Green** | `#5A8C6F` | Éxito, disponible, confirmado |
| **Warm Amber** | `#C49B4A` | Advertencia, ocupación media |
| **Soft Red** | `#C95A5A` | Error, overbooking, cancelado |

### Neutrals (cálidos)
| Color | Hex | Uso |
|---|---|---|
| **Bg Warm** | `#F7F4F0` | Fondo de pantalla |
| **Card** | `#FFFFFF` | Fondo de tarjetas |
| **Border** | `#E5E0D8` | Bordes suaves |
| **Text** | `#1C1C2E` | Texto principal |
| **Text Muted** | `#6B6B80` | Texto secundario |
| **Text Inverse** | `#FFFFFF` | Texto sobre fondos oscuros |

### Sidebar
- Fondo: gradient `#1E2E4A` → `#2A3E5A`
- Texto: `#FFFFFF`
- Item activo: bg `rgba(255,255,255,0.12)`
- Hover: bg `rgba(255,255,255,0.06)`

### Gradientes recomendados
- Hero/Header: `#1E2E4A` → `#2E4A7A`
- CTA: `#D47A5A` → `#C46A4A`
- Sidebar: `#1E2E4A` → `#2A3E5A`

### Reemplazo de colores viejos
| Viejo | Nuevo | Dónde |
|---|---|---|
| `#0f4c81` | `#1E2E4A` | Azul primario genérico → Deep slate |
| `#1a6bb5` | `#2E4A7A` | Azul claro → Slate medium |
| `#e67e22` | `#D47A5A` | Naranja genérico → Terracota |
| `#27ae60` | `#5A8C6F` | Verde brillante → Sage |
| `#f8f9fc` | `#F7F4F0` | Fondo gris frío → Fondo cálido |
| `#1a1a2e` | `#1C1C2E` | Texto casi negro |

---

## ⚠️ Importante: Reemplazo de colores en prompts

Los prompts individuales (1-8) usan los **colores viejos** en sus descripciones. Al pegar un prompt en Open Design, **reemplazá estos valores** por los de la nueva paleta:

| Viejo | Reemplazar por |
|---|---|
| `#0f4c81` | `#1E2E4A` |
| `#1a6bb5` | `#2E4A7A` |
| `#e67e22` | `#D47A5A` |
| `#27ae60` | `#5A8C6F` |
| `#f8f9fc` | `#F7F4F0` |
| `#1a1a2e` | `#1C1C2E` |
| `#6b7280` | `#6B6B80` |
| `#d1d5db` | `#E5E0D8` |
| `#e74c3c` | `#C95A5A` |
| `#f59e0b` | `#C49B4A` |

---

## 📐 Reglas de Responsive Design (aplican a TODOS los prompts)

Cada prompt incluye la versión mobile (375×812) y su adaptación a desktop (≥1024×768).

### Sistema de Grid responsive:
- **Mobile (<768px)**: Single column, cards apilados, full-width
- **Tablet (768-1024px)**: 2 columnas para KPIs, sidebar opcional
- **Desktop (≥1024px)**: Layout con sidebar izquierda fija (240px), contenido central, header superior

### Sidebar de escritorio (aplica a todas las pantallas):
- Ancho: 240px fijo
- Fondo: #0f4c81 con texto blanco
- Logo arriba: "Habidex" en blanco 18px bold
- Navegación: icono 20px + texto 14px, item activo con bg rgba(255,255,255,0.15)
- Items: Dashboard, Disponibilidad, Tarifas, Reservas, Perfil/Config
- Badge del plan actual abajo: "Free" pill con bg rgba(255,255,255,0.2)
- En mobile: la sidebar se oculta, reemplazada por bottom nav o hamburger menu

### Bottom Navigation (mobile):
- 5 iconos + label en la parte inferior, 56px height, bg blanca, sombra superior
- Items: 🏠 Inicio, 📅 Calendario, 💲 Tarifas, 📋 Reservas, ⚙️ Perfil
- Activo: icono #0f4c81, label 10px bold. Inactivo: #9ca3af
- En desktop: no existe, reemplazado por sidebar

### Tipografía responsive:
- Mobile: 16px base, KPIs 72px, títulos 20px, cuerpo 15px
- Desktop: 18px base, KPIs 96px (más grandes en pantalla grande), títulos 24px
- La jerarquía visual se mantiene, solo cambia el tamaño

---

## Cómo usar estos prompts

1. Abre Open Design en tu máquina
2. Crea un nuevo proyecto o usa el activo
3. Copia el prompt completo (incluyendo colores, layout, componentes)
4. Pégalo en Open Design y genera
5. Repite por cada pantalla

---

## Prompt 1: Login / Registro

```
Create a mobile-first login/registration screen for a B2B hotel management PWA targeting Colombian hotel owners (58yo, low tech literacy). The screen MUST fit a 375×812 viewport (iPhone-like) but scale to any mobile screen.

## Color Palette
- Primary dark blue: #0f4c81, Primary light blue: #1a6bb5
- Accent orange: #e67e22
- Background top gradient: #0f4c81 → #1a6bb5 (40% of screen height)
- Background bottom: #ffffff
- Text on dark: #ffffff, Text on light: #1a1a2e
- Muted text: #6b7280, Error red: #e74c3c
- Input bg: #f8f9fc, Input border: #d1d5db, Input border focus: #0f4c81

## Layout (single column, centered)
1. TOP SECTION (40% height, gradient bg #0f4c81 → #1a6bb5):
   - Centered logo placeholder: white circle 80px with house icon, below it "Habidex" in white bold 22px, below "Tu hotel en control" white 14px

2. BOTTOM SECTION (60% height, white bg, rounded top corners 24px):
   - Tab switcher: two centered text buttons side by side "Iniciar sesión" (active) | "Registrarse" (inactive). Active tab: text #0f4c81 bold with 2px underline. Inactive: text #9ca3af.

3. LOGIN FORM (visible by default):
   - Input "Correo electrónico": icon left, placeholder "correo@ejemplo.com", 48px height, rounded 12px, bg #f8f9fc, border 1px #d1d5db. On focus: border #0f4c81.
   - Input "Contraseña": same style with eye toggle icon on right to show/hide, placeholder "••••••••", 12px bottom margin
   - Button "Iniciar sesión": full width, 56px height, bg #0f4c81, text white bold 17px, rounded 14px. Touch target 56px. On press: opacity 0.85.
   - Link "¿Olvidaste tu contraseña?": centered, 14px, #6b7280, underline
   - Space 24px
   - Divider: line — "o" — line, muted gray
   - Button "Continuar con Google": full width, 52px height, outline 1.5px #d1d5db, rounded 14px, text #374151 15px, Google logo 20px left

4. REGISTRATION FORM (hidden by default, scrollable within the 60% area):
   - Same input style for: Nombre completo, Correo electrónico, Teléfono (with +57 prefix), Nombre del hotel, Contraseña, Confirmar contraseña
   - Button "Crear cuenta": full width, 56px height, bg #e67e22, text white bold 17px, rounded 14px
   - Below: "Al registrarte aceptas nuestros Términos y Condiciones" 11px #9ca3af

## Typography
- System font stack (SF Pro / Roboto)
- Headings: 22px bold, Body: 16px, Input labels/placeholders: 15px, Small text: 11-14px
- All text in Español colombiano

## Touch & Accessibility
- ALL touch targets minimum 48×48px, buttons 56px height
- High contrast: 4.5:1 minimum on all text
- Focus indicators: 2px #e67e22 outline on inputs
- Ample whitespace between form fields (16px gap)
- No horizontal scroll whatsoever

## States
- Loading: button shows spinner, text stays, bg color same
- Error: red border on input + error message below in #e74c3c 13px
- Success: field briefly shows green check #27ae60
- Disabled: button opacity 0.5 during submission
```

---

## Prompt 2: Dashboard Principal

```
Create a mobile-first hotel dashboard for a B2B PWA. User is Don José, 58yo Colombian hotel owner. Screen fits 375×812 viewport mobile.

## Color Palette
- Primary: #0f4c81, Light blue: #1a6bb5
- Accent: #e67e22 (orange)
- Success green: #27ae60, Warning orange: #e67e22, Danger red: #e74c3c
- Background: #f8f9fc, Cards: #ffffff
- Text primary: #1a1a2e, Text muted: #6b7280
- Free-plan locked features: #d1d5db bg, #9ca3af text
- Shadow card: 0 2px 8px rgba(0,0,0,0.08)

## Layout (single scroll column, no horizontal scroll)

1. TOP BAR (48px height, white bg, bottom shadow):
   - Left: hotel avatar 36px circle (placeholder gradient #0f4c81→#1a6bb5 with white "H") + "Hotel Paraíso" 16px bold
   - Right: bell icon 24px (with red dot for unread) + "Free" badge (pill, bg #d1d5db, text #6b7280 11px bold, 22px height)

2. WELCOME SECTION (16px top padding):
   - "Buenos días, Don José" 20px bold #1a1a2e
   - "Lunes, 30 de junio de 2026" 13px #6b7280

3. MAIN KPI CARD (white card, rounded 16px, padding 20px, margin 16px horizontal, shadow):
   - Label "Ocupación de hoy" 13px #6b7280 uppercase tracking 0.5px
   - Big number: "84%" in 72px bold. Color logic: green #27ae60 if >70%, orange #e67e22 if 30-70%, red #e74c3c if <30%
   - Sub: "12 de 14 habitaciones ocupadas" 14px #6b7280
   - Below, a thin bar showing 14 boxes horizontally: 12 filled #27ae60, 2 empty #e5e7eb (visual occupancy indicator)

4. METRICS GRID (2×2, gap 12px, margin 16px horizontal):
   Each card: white bg, rounded 12px, padding 14px, shadow
   - ADR: "$120.000" 18px bold, label "Tarifa promedio" 11px muted
   - RevPAR: "$85.000" 18px bold, label "RevPAR" 11px muted
   - Reservas hoy: "3" 18px bold, label "Reservas hoy" 11px muted
   - Check-ins: "2" 18px bold, label "Check-ins" 11px muted

5. OCCUPANCY CHART (white card, rounded 16px, padding 16px, margin 16px horizontal):
   - Title "Ocupación 7 días" 15px bold #1a1a2e
   - 7 vertical bars in a row, each: date label below (11px, "Lun", "Mar" etc), bar with rounded top, height proportional to value (30% to 100%), colors same logic (green/orange/red). Bar width: ~40px each, gap 8px
   - Current day bar highlighted with #0f4c81 outline
   - All bars visible without scrolling (horizontal flex, fits viewport)

6. RECENT BOOKINGS SECTION (white card, rounded 16px, padding 16px, margin 16px horizontal):
   - Title "Últimas reservas" 15px bold, right link "Ver todas" 13px #0f4c81
   - 4 booking rows, each with:
     - Left: Guest initial avatar circle 40px (bg #e67e22, white initial)
     - Center: "María García" 15px bold, "24-28 Jun • Hab 204 • $320.000" 12px muted, two lines
     - Right: Channel icon (Booking: blue rounded square "B", Despegar: green "D", Direct: gray "DD")
     - Divider line between rows
   - Each row touch target 56px height

7. LOCKED FEATURES TOOLTIPS (appear inline in cards):
   - "Mejora tu plan para acceder" in bg #d1d5db text #9ca3af 12px, lock icon left, rounded 8px, padding 8px 12px
   - Appears on: advanced analytics preview, revenue forecast

8. FLOATING ACTION BUTTON (fixed position, bottom 24px right 16px, z-index 100):
   - Circle 60px, bg #e67e22, shadow 0 4px 12px rgba(230,126,34,0.4)
   - White "+" icon 28px bold
   - On tap simulation: button scales to 1.1 then back

## Typography
- Base 16px, system font
- Big KPI: 72px bold, Metrics: 18px bold, Body: 15px, Secondary: 12-13px
- All Spanish colombiano, peso en COP con formato ($80.000)

## States
- Loading: shimmer skeleton for KPI cards (animated gradient)
- Empty state (no bookings): "Aún no hay reservas" centered illustration + text
- Error: inline toast "Error al cargar datos" red banner top

## Touch & Accessibility
- FAB touch target 60×60px (exceeds 48px minimum)
- Cards touch targets minimum 48px
- Contrast: all text 4.5:1 minimum
- Reduced motion support: no animations, use fade transitions only
- No horizontal scroll, no pinch zoom needed
```

---

## Prompt 3: Calendario de Disponibilidad

```
Create a mobile-first availability calendar for a B2B hotel PWA. Colombian hotel owner (58yo, low tech). Screen 375×812, single scroll column.

## Color Palette
- Primary: #0f4c81, Light blue: #1a6bb5, Accent: #e67e22
- Available green: #27ae60 bg with white text (availability >70%)
- Medium yellow: #f59e0b bg with dark text (30-70%)
- Low red: #e74c3c bg with white text (<30%)
- Today highlight: 2px #0f4c81 border on cell
- Calendar bg: #ffffff, Header row bg: #f8f9fc
- Weekend days: light gray tint #f3f4f6

## Layout

1. HEADER (48px, white bg, bottom border #e5e7eb):
   - Left: hamburger or back icon 24px
   - Center: "Disponibilidad" 17px bold #1a1a2e
   - Right: notification bell 24px

2. MONTH NAVIGATOR (52px height, white bg):
   - Left arrow ◀ button 44×44px (touch target), circle bg #f3f4f6 on press
   - Center: "Junio 2026" 18px bold #1a1a2e
   - Right arrow ▶ button 44×44px same style
   - Smooth swipe gesture hint (small dots or line indicating swipeable)

3. ROOM FILTER (horizontal scroll, 44px height, padding 12px horizontal):
   - Four pill buttons: "Todas" (active: bg #0f4c81, text white), "Estándar", "Premium", "Suite" (inactive: bg #f3f4f6, text #374151)
   - All pills 50+px wide, 36px height, rounded 18px
   - Horizontal scroll allowed only for this filter row (single line)

4. CALENDAR GRID:
   - Day headers row: "L" "M" "M" "J" "V" "S" "D" in 12px bold #6b7280, each column equal width (about 51px on 375px screen)
   - Grid rows: 5-6 rows of 7 cells each
   - Each cell: 44×44px minimum, rounded 8px
     - Top: day number 16px bold (today: white text in #0f4c81 circle)
     - Bottom: availability count "4/6" 11px (available/total)
   - Cell background color:
     - Green #27ae60 if availability >70% (white text)
     - Yellow #f59e0b if 30-70% (dark text #1a1a2e)
     - Red #e74c3c if <30% (white text)
   - Previous/next month days: opacity 0.3, no interaction
   - Today: border 2px solid #0f4c81

5. LEGEND (12px padding horizontal, 8px gap between items):
   - Three indicators side by side: ● Verde (>70% libre), ● Amarillo (30-70%), ● Rojo (<30%)
   - 12px text #6b7280, colored dots 8px

6. QUICK SUMMARY (white card, rounded 12px, padding 12px, margin 16px):
   - "Hoy: 12 disponibles de 14 habitaciones" 14px
   - Thin progress bar: 12/14 filled green, 2/14 empty gray

7. MODAL (appears on cell tap - transient overlay):
   - Full-screen semi-transparent backdrop (#000 50% opacity)
   - Sheet from bottom: white bg, rounded top 20px, padding 24px
   - Title: "Disponibilidad - Martes 30 Jun" 17px bold
   - Label: "Habitaciones disponibles" 14px
   - Stepper control: − (44px) | number 24px bold | + (44px), centered
   - Sub: "de 14 habitaciones totales" 13px #6b7280
   - Two buttons row: "Cancelar" (outline, #6b7280) | "Guardar" (filled #0f4c81, white text), both 48px height, rounded 12px
   - Tap outside modal to dismiss

## Interactions
- Swipe left/right on calendar area → prev/next month with slide animation (0.3s)
- Tap on date cell → modal opens with current availability for that day
- Tap on filter pill → grid updates to show only that room type's availability
- + and - buttons: change count with haptic feedback visual (scale 0.95 on press)
- "Guardar": shows brief "Guardado ✓" toast for 2 seconds, modal closes

## Typography
- Day numbers: 16px bold, Count: 11px
- Modal numbers: 24px bold
- Filters: 13px medium
- All COP format, DD/MM dates

## Accessibility
- Each calendar cell: minimum 44×44px touch target (48×48px ideal)
- Modal buttons: 48px height
- Color is NOT the only indicator - text shows "4/6" availability count
- Keyboard: number input via stepper (no free-form typing)
- Reduced motion: swipe becomes tap arrows
```

---

## Prompt 4: Gestión de Tarifas

```
Create a mobile-first rate management screen for a B2B hotel PWA. Colombian hotel owner, 58yo. Shows pricing calendar for rooms. 375×812 viewport.

## Color Palette
- Primary: #0f4c81, Accent: #e67e22
- High season: #e74c3c (red bg, white text)
- Mid season: #f59e0b (amber bg, dark text)
- Low season: #27ae60 (green bg, white text)
- Default cell: #f8f9fc with #1a1a2e text
- Money green: #059669 (for amounts)
- Card bg: #ffffff, Screen bg: #f8f9fc

## Layout

1. TOP HEADER (similar to calendar):
   - "Tarifas" 17px bold
   - Month nav: ◀ Junio 2026 ▶ (buttons 44×44px)
   - Right: info icon 24px (shows rate change history)

2. ROOM FILTER (horizontal pills):
   - Same pill style: "Todas" | "Estándar" | "Premium" | "Suite"
   - Active: bg #0f4c81 text white, Inactive: bg #f3f4f6 text #374151

3. SEASON LEGEND (colored dots row with labels):
   - ● Alta (rojo), ● Media (amarillo), ● Baja (verde)
   - 12px text, 8px dots, gap 16px
   - Below: "Toca un día para ajustar el precio" 12px #6b7280 italic

4. BULK ACTION BUTTON:
   - "Ajuste por temporada →" button: full-width except 16px margin, 48px height, bg #0f4c81, text white bold 14px, rounded 12px
   - Left: calendar+wand icon

5. CALENDAR GRID (same 7-column layout as availability):
   - Day headers: L M M J V S D (12px bold #6b7280)
   - Each cell: 48×52px minimum
     - Top: day number 14px bold
     - Bottom: price "$80.000" 12px bold #059669
   - Cell bg season colors:
     - Red tint #fef2f2 for high season dates
     - Amber tint #fffbeb for mid season
     - Green tint #ecfdf5 for low season
   - Current day: #0f4c81 border 2px

6. PRICE EDIT MODAL (on cell tap):
   - Bottom sheet, white bg, rounded top 24px, padding 20px
   - "Editar tarifa - Martes 30 Jun" 17px bold
   - Current price display: "$80.000" 28px bold #059669
   - Season selector: three pills "Alta" | "Media" | "Baja" with respective bg colors
   - Input row: "$" sign + text input "80.000" (number keyboard, 48px height, border #d1d5db)
   - Quick presets row: "56.000" "72.000" "90.000" "120.000" as small pills (36px height, bg #f3f4f6)
   - Notes field: optional, "Ej: temporada de fin de año" placeholder, 40px height
   - Actions: "Aplicar a todos los días de la temporada" checkbox (14px)
   - Two buttons: "Cancelar" (outline) | "Guardar" (filled #0f4c81), both 48px height, rounded 12px

7. SEASON BULK MODAL (from "Ajuste por temporada" button):
   - Bottom sheet
   - Title: "Ajuste masivo de tarifas" 17px bold
   - "Selecciona fechas:" with date range picker (two inputs: Desde - Hasta, DD/MM/YYYY format)
   - "Temporada:" pill selector Alta/Media/Baja
   - "Precio base:" input "$" + number, 48px height
   - "Ajuste % (opcional):" "-20%" | "+10%" | "+30%" preset buttons
   - "Aplicar a:" room type selector
   - Preview text: "Se actualizarán 12 días" 13px #6b7280
   - Button "Aplicar cambios" 48px height, bg #e67e22, white text
   - Button "Cancelar" outline

## Interactions
- Tap cell → price modal opens with current values
- Change season pill → cell bg color updates in real-time preview
- Tap preset price → fills input field
- "Aplicar a todos los días de la temporada": updates all same-season cells (confirmation dialog: "¿Aplicar a 18 días de temporada alta?" with "Sí, aplicar" / "No")
- Bulk modal: date range picker uses DD/MM/YYYY numeric input
- Success toast: "Tarifa actualizada ✓" (green), stays 2s
- Error: field validation if price > $1.000.000 show warning

## Typography
- Prices: 12-28px bold, using number format $80.000 (point as thousands separator)
- Dates: always DD/MM format
- System font, Spanish colombiano

## Accessibility
- ALL touch targets minimum 48px
- Price input uses numeric keypad (inputmode="numeric")
- Season colors have high contrast AND text indicator (season name visible)
- "Día sin tarifa" shown in cells with no price set
- Reduced motion: no animation on modal, just fade in/out
```

---

## Prompt 5: Lista de Reservas

```
Create a mobile-first bookings list screen for a B2B hotel PWA. Don José, 58yo Colombian hotel owner. Shows all reservations with status and channel. 375×812 viewport.

## Color Palette
- Primary: #0f4c81, Accent: #e67e22
- Confirmed status: #27ae60 (green left border)
- Pending status: #f59e0b (amber)
- Canceled status: #e74c3c (red)
- Completed: #6b7280 (gray)
- Channel colors: Booking #003b95, Despegar #00a650, Directo #6b7280
- Card bg: #ffffff, List bg: #f8f9fc
- Text: #1a1a2e, Muted: #6b7280

## Layout

1. HEADER (48px height):
   - "Reservas" 20px bold #1a1a2e
   - Badge counter: "12" in #0f4c81 pill next to title
   - Right: search icon 24px + filter icon 24px

2. STATUS FILTER PILLS (horizontal scroll row, 48px height):
   - "Todas (12)" active: bg #0f4c81 text white
   - "Hoy (3)" inactive: bg #f3f4f6 text #374151
   - "Este mes (8)" inactive: same
   - "Pendientes (2)" inactive: same
   - Each pill: min 70px width, 36px height, rounded 18px, padding 12px horizontal

3. BOOKING LIST (scrollable, takes remaining space):
   Each item card: white bg, rounded 12px, margin 8px 16px, left border 4px solid (color by status), padding 14px, shadow

   Layout per card (flex row):
   - LEFT: Avatar 44px circle with initials, bg color based on first letter hash palette
   - CENTER (flex 1, padding left 12px):
     - Row 1: "María García" 15px bold #1a1a2e
     - Row 2: "24-28 Jun • Hab 204" 13px #6b7280 (dates and room)
     - Row 3: "Booking.com" with channel icon + "$320.000" 13px bold #059669
   - RIGHT: Status badge (pill, 12px bold):
     - "Confirmada": bg #d1fae5 text #065f46
     - "Pendiente": bg #fef3c7 text #92400e
     - "Cancelada": bg #fee2e2 text #991b1b

   Channel icon badges (on "Booking.com" line):
   - Booking: rounded square bg #003b95 18px, white "B" 10px bold
   - Despegar: rounded square bg #00a650, white "D"
   - Directo: rounded square bg #6b7280, white "DD"

   Card is tappable (minimum ~88px height)

4. EMPTY STATE:
   - Centered illustration: calendar icon with X
   - "No hay reservas para este período" 16px #6b7280
   - "Prueba ajustando los filtros" 13px #9ca3af

5. BOOKING DETAIL MODAL (on card tap):
   - Bottom sheet, 80% height, white bg, rounded top 24px
   - Top: "Detalle de la reserva" 17px bold + close X button
   - Info sections:
     - "Huésped": María García, maria@email.com, +57 300 123 4567
     - "Fechas": Check-in 24/06/2026 15:00, Check-out 28/06/2026 12:00 (3 noches)
     - "Habitación": 204 - Premium - 2 camas
     - "Canal": Booking.com (con icono) - ID: BKG-38472
     - "Tarifa": $320.000 COP (Tarifa flexible)
     - "Estado": Confirmada ✓ (con badge verde)
     - "Notas": "Llegada tarde, después de las 20:00" (si aplica)
   - Actions: "Modificar" | "Cancelar reserva" | "Marcar como check-in" (all 48px buttons)

6. PULL TO REFRESH:
   - Pull down indicator: spinner #0f4c81
   - "Actualizando..." text 13px #6b7280

## Typography
- Guest name: 15px bold, Details: 13px, Price: 13px bold
- Amounts: $320.000 format (point separator)
- Dates: DD/MM format
- System font, Colombian Spanish

## Accessibility
- Each card minimum 48px touch target (actual ~88px)
- Status NOT indicated by color alone - status badge text is always visible
- Channel indicated by both icon AND text name
- Pull to refresh also has a "Refresh" button in top bar for accessibility
- Reduced motion: no card entrance animations
```

---

## Prompt 6: Perfil del Hotel / Configuración

```
Create a mobile-first hotel profile / settings screen for a B2B PWA. Don José, 58yo Colombian hotel owner. Shows hotel info, plan, OTA connections, and WhatsApp link. 375×812 viewport.

## Color Palette
- Primary: #0f4c81, Accent: #e67e22
- Success green: #27ae60, Warning: #f59e0b
- Card bg: #ffffff, Screen bg: #f8f9fc
- Text primary: #1a1a2e, Muted: #6b7280
- Disabled: #d1d5db

## Layout (single scroll column)

1. HOTEL HEADER (white bg, rounded bottom 24px, shadow):
   - Large circular avatar 80px (hotel photo or gradient placeholder with building icon)
   - "Hotel Paraíso" 22px bold #1a1a2e
   - Location row: 📍 "Tolú, Sucre" 14px #6b7280
   - Phone row: 📞 "+57 300 123 4567" 14px #0f4c81 (tappable to call)

2. CURRENT PLAN CARD (white card, rounded 16px, padding 16px, margin 16px, shadow, left border #e67e22 if free):
   - Row: "Plan actual" label 13px muted + "Free" badge (pill, bg #d1d5db, text #6b7280, bold 12px)
   - "5 habitaciones · 1 canal OTA · Sync cada 30 min" 13px #6b7280
   - Button "Mejorar plan" (full width, 48px height, bg #e67e22, text white bold 15px, rounded 12px)
   - Small text: "Comparar planes →" 12px #0f4c81 link

3. CONEXIONES OTA SECTION:
   - Title "Canales de venta" 16px bold #1a1a2e + add button "+"
   - Connection items (each white card, rounded 12px, padding 14px, margin 8px 0, shadow):
     - Booking.com: row with icon (blue rounded square "B") + "Booking.com" 15px bold + ✅ "Conectado" green 12px
     - Despegar: row with icon (green "D") + "Despegar" 15px bold + ✅ "Conectado" green 12px
     - Airbnb: row with icon (pink rounded square "A") + "Airbnb" 15px bold + ⏳ "Pendiente" amber 12px
     - Each has a sub-row showing: "10 hab disponibles · Sincronizado: Hoy 14:30" 11px #6b7280

4. WHATSAPP SECTION (white card, rounded 16px, padding 16px, shadow):
   - Title "WhatsApp" 16px bold
   - Status row: 📱 "Conectado al número +57 300 987 6543" or "No conectado" with action
   - If not connected: QR code placeholder (200×200px, white bg, black QR pattern, centered) + "Escanea con WhatsApp para recibir notificaciones" text
   - If connected: green check + "Recibirás notificaciones de reservas aquí"

5. SETTINGS LIST:
   - "Datos del hotel" icon + arrow →
   - "Usuarios y accesos" icon + arrow →
   - "Métodos de pago" icon + arrow →
   - "Facturación" icon + arrow →
   - "Idioma: Español" icon + arrow →
   - "Cerrar sesión" red icon + text (no arrow)

## Interactions
- Tap "Mejorar plan" → scrolls or navigates to plans comparison
- Tap "Comparar planes" → shows all plans modal
- Tap OTA item → opens detail (reconnect, view stats)
- Tap QR → copies WhatsApp setup instructions
- Tap phone number → opens phone dialer
- "Cerrar sesión" → confirmation dialog

## Colors for plan badges
- Free: bg #d1d5db text #6b7280
- Micro: bg #e8f0fe text #0f4c81
- Starter: bg #fef3c7 text #92400e
- Growth: bg #d1fae5 text #065f46
- Pro: bg #ede9fe text #5b21b6
- Enterprise: bg #fce7f3 text #9d174d
```

---

## Prompt 7: Onboarding (Primera Vez)

```
Create a mobile-first onboarding/wizard experience for a B2B hotel PWA. First-time user Don José (58yo, low tech literacy). 4 horizontal swipeable steps with progress indicator. 375×812 viewport.

## Color Palette
- Primary: #0f4c81, Accent: #e67e22
- Background: white #ffffff
- Progress dots active: #0f4c81, inactive: #d1d5db
- Text: #1a1a2e, Muted: #6b7280
- Button bg: #0f4c81, text white

## Layout (full screen, no scroll within step, only horizontal swipe between steps)

GLOBAL:
- Top-right: "Omitir" text button (14px #6b7280, 44px touch target)
- Bottom: progress dots (3 small circles 8px, gap 6px, active #0f4c81, inactive #d1d5db)
- Bottom: "Siguiente" button (full width 56px height, #0f4c81, white text bold 17px, rounded 14px, margin 16px)
- Last step button says "¡Ir al Dashboard!"

STEP 1: "Bienvenido"
- Large centered illustration: house icon inside shield (80px, #0f4c81)
- "Tu hotel en control" 24px bold #1a1a2e
- "Gestiona tus habitaciones, tarifas y reservas desde un solo lugar. Todo desde tu celular." 15px #6b7280 centered, padding 0 32px
- Sub-text: "Sin instalar nada, sin complicaciones" 13px #6b7280

STEP 2: "Conecta tus canales"
- Illustration: three connected nodes (Booking, Despegar, your platform) as simple graphic 80px
- "Conecta tus canales de venta" 24px bold
- "Booking.com, Despegar y más. Una sola vez, y la plataforma sincroniza todo automáticamente." 15px #6b7280 centered
- Feature pills below: "🔄 Sin overbookings" | "📱 Todo en tu celular" | "💬 Alertas WhatsApp"

STEP 3: "Configura tus habitaciones"
- Illustration: simple 3-floor building with windows 80px
- "Agrega tus habitaciones" 24px bold
- "Dinos cuántas habitaciones tienes y sus tipos: estándar, premium, suite. Nosotros hacemos el resto." 15px #6b7280
- Quick input: "¿Cuántas habitaciones tienes?" + number stepper (− 44px | 14 | + 44px) centered

STEP 4: "¡Todo listo!"
- Large checkmark circle 80px, bg #27ae60, white check
- "¡Listo, Don José!" 24px bold #1a1a2e
- "Tu hotel ya está configurado. Empieza a gestionar tus reservas." 15px #6b7280
- "🔔 Primera notificación: confirma tu email para recibir alertas" small highlight box

## Interactions
- Swipe left → next step with slide animation (0.3s ease)
- Swipe right → previous step
- Tap "Siguiente" → same as swipe left
- Tap "Omitir" → skip to last step with confirmation "¿Omitir tutorial?" (Sí / No)
- Progress dots are tappable (48px target) to jump to step
- Last step "¡Ir al Dashboard!" → navigates to main app
- No back button on step 1
- All transitions smooth, no jarring movements
```

---

## Prompt 8: Conexión WhatsApp (OpenWA)

```
Create a mobile-first WhatsApp connection screen for a B2B hotel PWA. Don José needs to link his WhatsApp number to receive booking notifications. 375×812 viewport.

## Color Palette
- Primary: #0f4c81, Accent: #e67e22
- Success: #27ae60, Background: #f8f9fc
- Card: #ffffff, Text: #1a1a2e, Muted: #6b7280

## Layout (single column, centered)

STEP 1: "Conecta tu WhatsApp" (default state)
- Large WhatsApp icon (green circle 80px with white phone icon, or WhatsApp brand green #25D366)
- "Recibe notificaciones en WhatsApp" 20px bold #1a1a2e
- "Enterate al instante cuando llegue una reserva, cuando tengas overbooking, o cuando necesites actualizar tu disponibilidad." 15px #6b7280 centered, padding 0 24px
- Benefits list with checkmarks:
  - ✅ "Confirmaciones de reserva automáticas"
  - ✅ "Alertas de overbooking en tiempo real"
  - ✅ "Recordatorios de check-in y check-out"
- Large QR CODE placeholder (white square 240×240px, border 1px #d1d5db, rounded 12px, centered, with simulated QR pattern)
- Below QR: "Escanea este código con tu WhatsApp" 14px #6b7280
- "Para escanear: abre WhatsApp > menú > WhatsApp Web > escanea" 12px #9ca3af
- Button "Ya escaneé el código" (48px height, #0f4c81, white text, rounded 12px, disabled until QR scanned)

STEP 2: "Verificando..." (loading state)
- Spinning circle #0f4c81 48px
- "Conectando con tu WhatsApp..." 16px #6b7280
- Sub-text: "Esto toma solo unos segundos" 13px #9ca3af
- (auto-transitions to Step 3 on success)

STEP 3: "¡Conectado!" (success state)
- Large green checkmark circle 80px, bg #27ae60
- "¡WhatsApp conectado!" 22px bold #1a1a2e
- Phone number display: "+57 300 987 6543" 18px bold #0f4c81
- "Ahora recibirás notificaciones de tus reservas aquí" 14px #6b7280 centered
- Card with examples:
  - "📅 Nueva reserva: María García - 24 Jun - Hab 204"
  - "⚠️ Overbooking detectado: 2 reservas para la misma habitación"
  - "📊 Reporte semanal: 85% de ocupación esta semana"
- Button "Entendido, ir al Dashboard" (48px height, #0f4c81, white text, rounded 12px)

STEP 4: Error state (if QR fails)
- Red X circle 80px, bg #e74c3c
- "No pudimos conectar" 20px bold
- "Puedes intentarlo de nuevo o hacerlo más tarde desde Configuración" 14px #6b7280
- Two buttons: "Reintentar" (#0f4c81) | "Más tarde" (outline, #6b7280), both 48px height

## Interactions
- "Ya escaneé el código": simulates verification, shows loading, then success
- If verification fails: shows error state with retry
- After success: "Entendido" navigates to dashboard
- QR regenerates every 60 seconds (show countdown "Código válido por 45s")
- Pull to refresh QR if it expired
```

---

## Notas para Open Design

1. **Brand colors**: #0f4c81 (azul marino), #e67e22 (naranja acento), #27ae60 (verde éxito)
2. **Tipografía**: sistema (SF Pro / Roboto), base 16px
3. **Touch**: todos los objetivos ≥48×48px, botones principales 56px altura
4. **Formato moneda**: $80.000 COP (punto como separador de miles)
5. **Fechas**: DD/MM/YYYY (formato colombiano)
6. **Idioma**: Español colombiano ("habitación", "ocupada", "celular")
7. **Responsive**: mobile-first 375×812 → desktop ≥1024×768 con sidebar

---

## 📱 → 🖥️ Adaptación a Desktop por Pantalla

### 1. Login / Registro — Desktop
- Mobile: single column centrado, top gradient + bottom form
- **Desktop**: formulario centrado en un card de 420px max-width, fondo completo con gradient suave. Logo + nombre del producto arriba-centrado. El formulario no ocupa toda la pantalla, máximo 500px de ancho en un card con sombra. Background: gradient completo #0f4c81 → #1a6bb5 con el form card blanco superpuesto al centro vertical y horizontal.

### 2. Dashboard — Desktop
- Mobile: single column scroll, FAB flotante
- **Desktop**: sidebar izquierda (240px, #0f4c81) + contenido a la derecha. KPIs en grid 4 columnas (en mobile son 2×2). Ocupación 7 días: las barras se ven más grandes y separadas. Últimas reservas: tabla con columnas en vez de cards. El FAB se mueve a la derecha del contenido, no sobre la sidebar. En desktop se puede ver el dashboard completo sin scroll vertical en una pantalla 1080p.

### 3. Calendario Disponibilidad — Desktop
- Mobile: grid 7 columnas ajustado al ancho
- **Desktop**: el calendario ocupa el área central completa (después de la sidebar). Las celdas son más grandes (60×60px mínimo), se ven más días del mes sin scroll. El modal de edición se convierte en un panel lateral derecho (350px) en vez de bottom sheet. La leyenda de colores va arriba del calendario en vez de abajo.

### 4. Gestión de Tarifas — Desktop
- Mobile: calendario con montos, modal bottom sheet
- **Desktop**: calendario expandido al área disponible. Los montos se ven más claros. El modal de edición de precio se convierte en panel lateral derecho (400px) con el calendario visible al fondo. El botón "Ajuste por temporada" abre un modal centrado en vez de bottom sheet. Se puede seleccionar un rango de fechas arrastrando el mouse.

### 5. Lista de Reservas — Desktop
- Mobile: cards verticales con scroll infinito
- **Desktop**: tabla con columnas (Huésped, Fechas, Habitación, Canal, Monto, Estado). Filas con hover highlight. Filtros arriba como pills o dropdown. El detalle de reserva se abre como panel lateral derecho (450px) en vez de bottom sheet. La tabla puede mostrar 15-20 reservas sin scroll.

### 6. Perfil del Hotel — Desktop
- Mobile: single column scroll
- **Desktop**: dos columnas — izquierda (40%): foto, plan, conexiones OTA. Derecha (60%): settings, WhatsApp status, facturación. El QR de WhatsApp se muestra más grande (300px). La configuración se organiza en secciones con pestañas horizontales.

### 7. Onboarding — Desktop
- Mobile: full screen swipable, full-width
- **Desktop**: card centrado de 600px max-width, con fondo suave detrás. Las ilustraciones se ven más grandes pero el contenido no se estira. Los botones "Siguiente" y "Omitir" mantienen su posición. No sidebar, no bottom nav — experiencia enfocada en el wizard.

### 8. Conexión WhatsApp — Desktop
- Mobile: single column, QR centrado
- **Desktop**: dos columnas — izquierda (50%): explicación + beneficios con checkmarks. Derecha (50%): QR grande (300px) centrado en un card blanco. Los estados de loading/success/error se muestran en la misma columna derecha. No sidebar visible, experiencia focused.
