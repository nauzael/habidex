# 🏝️ Constitución del Proyecto — Plataforma Hotelera B2B

**Versión:** 1.0  
**Ratificado:** 29 de junio de 2026  
**Proyecto:** Channel Manager + Revenue Management para hoteles independientes en LATAM

---

## Artículo I — Simplicidad MVP (YAGNI)

**Regla:** Toda complejidad se difiere hasta que sea estrictamente necesaria.

- En MVP (Fase 1-2), usar Modular Monolith con módulos NestJS. No introducir microservicios, Kafka, Kong, Debezium o database-per-tenant hasta que los indicadores lo justifiquen.
- Las decisiones de arquitectura se basan en evidencia (métricas), no en anticipación ("por si acaso en el futuro...").
- Si una herramienta o patrón no es necesario para que 10 hoteles funcionen en producción, se difiere.

**Gates para introducir complejidad:**
- Kafka: >200 hoteles activos o >100 req/s sostenidos
- Database-per-tenant: >500 hoteles o cliente Enterprise que lo exija
- Keycloak: necesidad de SSO multi-proveedor o OIDC para API pública (Fase 3+)

---

## Artículo II — Mobile-First + Offline-First

**Regla:** Toda feature debe funcionar en un Android gama media sin internet confiable.

- La plataforma es una **PWA**, no una app nativa. Los hoteleros objetivo no instalan apps.
- Toda operación core (marcar habitación ocupada/liberada, consultar disponibilidad, ver reservas) debe funcionar **offline** con sincronización posterior.
- La UI se diseña para pantallas de 5.5"-6.5" con brillo exterior y dedos (touch targets ≥44px).
- No se asume conectividad permanente: los mensajes de WhatsApp y las actualizaciones a OTAs se encolan y se envían cuando haya conexión.
- El consumo de datos se minimiza: compresión Brotli, assets WebP, code splitting con lazy loading.

---

## Artículo III — Pruebas Continuas

**Regla:** Los tests se escriben junto con el código, no después.

- Toda funcionalidad que afecte disponibilidad de inventario o cálculo de precios requiere **tests unitarios** antes del merge.
- Las integraciones con OTAs se prueban con **mock servers** que simulan latencia, timeouts, rate limits y errores HTTP.
- Antes de cada release, se ejecutan **load tests** (k6) simulando >10 hoteles con >50 requests simultáneas. Se bloquea la release si p99 >500ms.
- El SLA de "0 overbookings" se valida con tests de concurrencia: 10 requests paralelas actualizando la misma habitación → 0 inconsistencias.
- Los tests de sincronización offline cubren conflictos de merge con resolución CRDT (no solo "last write wins").

---

## Artículo IV — API-First Interno

**Regla:** Todos los módulos se comunican vía contratos explícitos (interfaces TypeScript), no vía imports directos de implementación.

- Cada módulo NestJS expone una `IModuleService` que define su contrato público.
- Los módulos no importan la implementación de otros módulos, solo la interfaz.
- Los cambios en una interfaz requieren revisión de compatibilidad backward.
- Esta regla facilita la extracción a microservicios cuando los gates del Artículo I se cumplan.

---

## Artículo V — Seguridad de Datos del Hotelero

**Regla:** La plataforma nunca expone datos de un hotel a otro hotel.

- RLS con `tenant_id` en PostgreSQL garantiza que cada query solo ve datos de su hotel.
- Las API keys de OTAs (Booking, Despegar, Expedia) se almacenan cifradas en reposo (AES-256).
- Los datos de huéspedes cumplen con Ley 1581 de 2012: consentimiento explícito, derechos ARCO, retención limitada.
- El audit log registra toda operación que modifique inventario o tarifas, con correlation ID y timestamp UTC.

---

## Artículo VI — Idioma y Contexto Local

**Regla:** La plataforma habla español colombiano, acepta COP, y entiende la realidad del hotelero costeño.

- Todo texto de UI, notificaciones, mensajes de error y documentación está en **español colombiano**.
- Los precios se muestran en **COP** con formato colombiano (punto como separador de miles).
- Los formatos de fecha usan `DD/MM/YYYY` (estándar colombiano).
- Los mensajes de WhatsApp usan lenguaje cálido y directo, no corporativo.
- La facturación cumple con los requisitos de la **DIAN** (factura electrónica XML UBL 2.1).

---

## Proceso de Enmienda

Para modificar esta constitución:
1. Documentar la razón del cambio
2. Revisar impacto en todas las secciones del plan de ejecución
3. Actualizar la versión y fecha de ratificación
4. Si el cambio afecta la arquitectura, generar nuevas correcciones en el plan de desarrollo

---

*Documento vivo — revisar cada 3 meses o al completar una fase mayor.*
