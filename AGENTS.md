# GUÍA DE ARQUITECTURA, DESARROLLO Y GITFLOW — R&M PERSONALIZA
> **Documento Oficial de Instrucciones para Agentes de IA y Desarrollador Único**  
> Basado en el informe oficial de titulación/entrega: *«Diseño del Sistema e Implementación de R&M Personaliza — Sección 17857»* (Rommel Eduardo Navarro Domínguez).

---

## 1. RESUMEN EJECUTIVO Y CONTEXTO DEL NEGOCIO

### 1.1 La Empresa
**R&M Personaliza** es una microempresa peruana ubicada en San Martín de Porres (Lima) dedicada a la confección y venta de regalos y artículos personalizados (tazas, prendas, joyería base grabada, peluches, sublimados y corte láser).

### 1.2 Problemática a Resolver
- Desorden en la recepción de pedidos dispersos en múltiples canales digitales (WhatsApp, Facebook Messenger, TikTok).
- Falta de control de tiempos en el ciclo de diseño y producción, causando retrasos en las entregas.
- Inexistencia de un control de inventario y kardex formal: quiebres de stock imprevistos de insumos clave (*blanks*, tintas, cajas).
- Nula emisión sistemática de comprobantes de pago (Boletas/Facturas electrónicas SUNAT).

### 1.3 Objetivo del Software (MVP)
Digitalizar y centralizar el flujo de valor completo en una solución web/PWA accesible tanto desde dispositivos móviles (celulares Android/iOS) como estaciones de trabajo de escritorio:
1. **Atención y Consultas (CU01):** Bandeja unificada y conversión a pedidos.
2. **Registro de Pedidos (CU02, CU03, CU04, CU10):** Ficha detallada con datos del cliente, producto, personalización y estado de arte.
3. **Módulo de Producción (CU05):** Panel de pedidos con arte aprobado y control de calidad.
4. **Módulo de Inventario / Kardex (CU06, CU07):** Recetas de insumos por producto y **descuento automático** del kardex al pasar a producción, con alertas de stock mínimo.
5. **Módulo de Facturación (CU08, CU09):** Emisión de comprobantes vinculados al pedido con cálculo de IGV (18%) y simulación/integración OSE/SUNAT.
6. **Módulo de Seguridad:** Autenticación y control de acceso basado en 4 roles (`ADMINISTRADOR`, `MARKETING`, `DISENADOR`, `OPERADOR`).

---

## 2. ARQUITECTURA DEL SISTEMA (PATRÓN MVC + DAO + CAPAS)

El sistema sigue de forma estricta la arquitectura de 3 capas aprobada en el documento de diseño:

```
┌─────────────────────────────────────────────────────────────┐
│                 CAPA DE PRESENTACIÓN (PWA)                  │
│       React + TypeScript + Tailwind CSS (Mobile-First)      │
│  [FrmConsultas] [FrmPedido] [FrmProduccion] [FrmKardex] ... │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS (REST API JSON / JWT)
┌──────────────────────────────▼──────────────────────────────┐
│             CAPA DE LÓGICA DE NEGOCIO (BACKEND)             │
│                     Python FastAPI REST                     │
│  [CtrlConsultas] [CtrlPedido] [CtrlProduccion] [CtrlKardex] │
│      [Servicios de Dominio] [IntegradorCanales] [OSE SUNAT] │
└──────────────────────────────┬──────────────────────────────┘
                               │ Llamadas internas DAO
┌──────────────────────────────▼──────────────────────────────┐
│           CAPA DE ACCESO A DATOS (MODELO + DAO)             │
│        Python DAOs + Conexión Pool a PostgreSQL 16          │
│  [DAOConsulta] [DAOPedido] [DAOInventario] [DAOComprobante] │
└──────────────────────────────┬──────────────────────────────┘
                               │ TCP / 5432 o HTTPS Supabase API
┌──────────────────────────────▼──────────────────────────────┐
│                  BASE DE DATOS (SUPABASE)                   │
│         PostgreSQL 16 Relacional con RLS y Triggers         │
│          rm_personaliza (Tablas, Vistas, Funciones)         │
└─────────────────────────────────────────────────────────────┘
```

### 2.1 Reglas de Oro de la Arquitectura
1. **Aislamiento Total del SQL (Patrón DAO):** Ninguna sentencia SQL debe escribirse fuera de la capa `daos/`. Los controladores invocan métodos del DAO (`crear`, `findById`, `updateEstado`, `registrarMovimiento`), y los DAOs retornan entidades u objetos serializables.
2. **Validación en los Límites:** Toda entrada desde la vista debe ser validada mediante esquemas **Pydantic** antes de procesarse en el controlador.
3. **Desacoplamiento de Servicios Externos:** Las llamadas a APIs externas (SUNAT/OSE, Facebook Graph, WhatsApp Cloud API) deben estar encapsuladas en adaptadores/servicios de infraestructura con modo stub/simulación para desarrollo local.

---

## 3. GUÍA DE DESARROLLO DEL BACKEND (`rym-backend`)

### 3.1 Stack Tecnológico
- **Lenguaje:** Python 3.11+ / 3.14+
- **Framework Web:** FastAPI
- **Servidor ASGI:** Uvicorn
- **Acceso a Datos:** Capa DAO utilizando `psycopg2-binary` (pool de conexiones) y/o cliente `supabase-py`
- **Modelos de Validación:** Pydantic v2
- **Seguridad:** Passlib (Bcrypt / Argon2), Python-Jose / PyJWT
- **Testing:** Pytest

### 3.2 Estructura de Directorios Mandatoria
```text
rym-backend/
├── app/
│   ├── api/
│   │   ├── v1/
│   │   │   ├── endpoints/
│   │   │   │   ├── auth.py
│   │   │   │   ├── consultas.py
│   │   │   │   ├── pedidos.py
│   │   │   │   ├── produccion.py
│   │   │   │   ├── kardex.py
│   │   │   │   ├── comprobantes.py
│   │   │   │   └── dashboard.py
│   │   │   └── router.py
│   ├── controllers/            # Controladores del patrón MVC
│   │   ├── ctrl_consultas.py
│   │   ├── ctrl_pedido.py
│   │   ├── ctrl_produccion.py
│   │   ├── ctrl_kardex.py
│   │   └── ctrl_comprobante.py
│   ├── services/               # Lógica de negocio e integraciones
│   │   ├── inventario_service.py # Descuento por recetas
│   │   ├── facturacion_service.py # Stub OSE / SUNAT
│   │   └── canales_service.py    # Stub Facebook/WhatsApp/TikTok
│   ├── daos/                   # Capa DAO estricta
│   │   ├── base_dao.py
│   │   ├── dao_seguridad.py
│   │   ├── dao_consulta.py
│   │   ├── dao_pedido.py
│   │   ├── dao_producto.py
│   │   ├── dao_inventario.py
│   │   └── dao_comprobante.py
│   ├── models/                 # Entidades del dominio
│   │   ├── usuario.py
│   │   ├── cliente.py
│   │   ├── consulta.py
│   │   ├── producto.py
│   │   ├── insumo.py
│   │   ├── pedido.py
│   │   └── comprobante.py
│   ├── schemas/                # Schemas Pydantic (DTOs)
│   │   ├── auth_schema.py
│   │   ├── pedido_schema.py
│   │   ├── kardex_schema.py
│   │   └── comprobante_schema.py
│   └── core/                   # Infraestructura y configuración
│       ├── config.py           # Variables de entorno (.env)
│       ├── database.py         # Pool de conexiones a Supabase PostgreSQL
│       └── security.py         # Hasheo de passwords y generación de JWT
├── tests/
│   ├── unit/                   # PU-01 a PU-06
│   └── integration/            # PI-01 a PI-04
├── requirements.txt
├── .env.example
├── .env
└── main.py
```

### 3.3 Casos de Uso Críticos en Backend
- **Transición de Estado del Pedido:**
  `RECIBIDO` ➔ `EN_DISENO` ➔ `EN_PRODUCCION` ➔ `PRODUCIDO` ➔ `ENTREGADO`.
- **Descuento Automático de Kardex (t2 ➔ EN_PRODUCCION):**
  Al enviar un pedido a producción (`CtrlProduccion.iniciarProduccion`), se debe consultar la receta de cada producto en `producto_insumos`, verificar saldo suficiente en `insumos`, y registrar movimientos tipo `SALIDA` con motivo `PRODUCIDO` en `movimientos_kardex`. Si el stock es insuficiente, se lanza `StockInsuficienteException` (PU-02).
- **Validación de Identidad SUNAT (CtrlComprobante):**
  DNI debe tener exactamente 8 dígitos numéricos (PU-05 y PU-06). RUC debe tener 11 dígitos y empezar con 10 o 20.

---

## 4. GUÍA DE DESARROLLO DEL FRONTEND (`rym-frontend`)

### 4.1 Stack Tecnológico
- **Framework:** React 18+ con TypeScript y Vite
- **Estilos:** Tailwind CSS (diseño Mobile-First adaptativo PWA)
- **Componentes UI:** Iconos Lucide-React, Modales, Badges de estado, Toasts
- **Enrutamiento:** React Router Dom v6
- **Cliente HTTP:** Axios o Fetch con interceptores para token JWT
- **PWA:** Soporte para manifest.json e instalación en Android/iOS

### 4.2 Nomenclatura de Vistas Principales (Conforme a Documentación)
- `FrmDashboard` (`/`):
  - KPIs del día: pedidos pendientes, en producción, total ventas mensual.
  - Widget de alertas de stock mínimo (resaltado en **rojo** para stock crítico y **amarillo** para saldo $\le$ stock mínimo).
- `FrmConsultas` (`/consultas` - CU01):
  - Bandeja multicanal unificada (WhatsApp, Facebook, TikTok).
  - Estado de atención (`PENDIENTE`, `ATENDIDA`).
  - Acción directa de "Convertir a Pedido".
- `FrmPedido` (`/pedidos/nuevo` y `/pedidos/:id` - CU02, CU03):
  - Selector/búsqueda de cliente por DNI/teléfono.
  - Catálogo de productos con selector de personalización (tallas, colores, textos).
  - Carga de imágenes de referencia/arte.
  - Registro de pagos/adelantos (Yape, Plin, Transferencia).
- `FrmProduccion` (`/produccion` - CU05):
  - Kanban o lista de pedidos aprobados para fabricación.
  - Visualización del arte final aprobado en alta resolución.
  - Checklist de control de calidad y botón "Finalizar Producción".
- `FrmKardex` (`/kardex` - CU06, CU07):
  - Tabla de insumos con saldo actual vs. stock mínimo.
  - Formulario modal para registrar compras/entradas de insumos.
  - Histórico de movimientos del kardex.
- `FrmComprobante` (`/comprobantes` - CU08, CU09):
  - Emisión de Boleta o Factura vinculada a pedidos entregados.
  - Cálculo automático de subtotal e IGV (18%).
  - Estado de validación SUNAT (`ACEPTADO`, `RECHAZADO`).

---

## 5. FLUJO DE TRABAJO GITFLOW PARA DESARROLLADOR ÚNICO (SOLO DEV)

Como eres el único desarrollador del proyecto, adaptamos **GitFlow** para mantener el orden, la trazabilidad de las entregas académicas y la estabilidad sin la burocracia de aprobaciones externas:

### 5.1 Estructura de Ramas

```
 main (v0.1.0-mvp) ──●──────────────────────────────● (v0.2.0)
                     │                              ▲
 release/v0.1.0 ─────┼──────────────●               │
                     │              │               │
 develop ────────────●────●─────────┴──────●────────┴──────●
                          ▲                ▲
 feature/kardex ──────────┘                │
 feature/pedidos ──────────────────────────┘
```

1. **`main`:** Rama de producción y entregas oficiales. Solo código estable, probado y listo para demostración. Cada entrega se marca con un Git Tag (ej. `v0.1.0-mvp`).
2. **`develop`:** Rama principal de integración activa. Aquí convergen todas las funcionalidades terminadas del MVP.
3. **`feature/<modulo-o-cu>`:** Ramas temporales creadas a partir de `develop` para desarrollar una funcionalidad específica.
   - `feature/setup-supabase-env`
   - `feature/cu06-kardex-insumos`
   - `feature/cu01-consultas`
   - `feature/cu02-pedidos`
   - `feature/cu05-produccion`
   - `feature/cu08-facturacion`
4. **`hotfix/<nombre>`:** Para corregir errores críticos detectados en `main`.

### 5.2 Convención de Commits (Conventional Commits)
Usa siempre el estándar semántico en español o inglés:
- `feat: agregar registro de insumos y cálculo de stock en DAOInventario`
- `fix: corregir validación de DNI a 8 dígitos en CtrlComprobante`
- `docs: actualizar AGENTS.md con credenciales de Supabase`
- `test: agregar prueba unitaria PU-01 para descuento de kardex`
- `refactor: separar consultas SQL de servicios hacia DAOs`

### 5.3 Comandos Habituales del Flujo Diario

```bash
# 1. Iniciar una nueva funcionalidad desde develop
git checkout develop
git pull origin develop
git checkout -b feature/cu06-kardex-insumos

# 2. Realizar cambios y commitear con sentido
git add .
git commit -m "feat(kardex): implementar modelo insumo y endpoints de saldo"

# 3. Integrar la funcionalidad en develop (sin fast-forward para conservar historial)
git checkout develop
git merge --no-ff feature/cu06-kardex-insumos -m "merge: integrar feature/cu06-kardex-insumos en develop"
git branch -d feature/cu06-kardex-insumos

# 4. Cuando el MVP esté listo para entrega/demo
git checkout main
git merge --no-ff develop -m "release: versión v0.1.0-mvp completa"
git tag -a v0.1.0-mvp -m "Entrega Final MVP R&M Personaliza"
```

---

## 6. HOJA DE RUTA DETALLADA PARA EL MVP (ROADMAP EN 4 FASES)

| Fase | Alcance Técnico | Casos de Uso | Entregables Clave |
| :--- | :--- | :--- | :--- |
| **Fase 1: Infraestructura & Kardex** | Configurar Supabase, tablas base, DAOSeguridad y DAOInventario. | CU06, CU07 | Script SQL ejecutado, alertas de stock mínimo funcionando, login funcional. |
| **Fase 2: Clientes, Consultas & Catálogo** | DAOConsulta, DAOProducto, recetas `producto_insumos`, bandeja multicanal. | CU01 | Registro de clientes, productos y recetas listas para producción. |
| **Fase 3: Flujo de Pedidos & Producción** | DAOPedido, ciclo de estados de pedido, control de calidad y descuento automático de kardex. | CU02, CU03, CU04, CU05 | Pedidos creados, arte aprobado, descuento automático verificado con PU-01/PU-02. |
| **Fase 4: Facturación & Dashboard** | DAOComprobante, cálculo IGV 18%, simulación OSE SUNAT, KPIs del Dashboard. | CU08, CU09, Dashboard | Emisión de boletas/facturas en PDF/pantalla, panel con métricas y alertas rojas/amarillas. |

---

## 7. INSTRUCCIONES ESTRICTAS PARA AGENTES DE IA (AI CO-PILOTS)

Cuando un agente trabaje en este repositorio, debe:
1. **Verificar el archivo `.env`** antes de realizar pruebas de conexión a Supabase.
2. **Respetar los nombres de clases y métodos:** Mantener `DAOPedido`, `DAOInventario`, `CtrlPedido`, `FrmPedido`, etc.
3. **No instalar librerías innecesarias:** Mantener el backend ligero con FastAPI, Pydantic y psycopg2/supabase; y el frontend con React + Tailwind.
4. **Validar siempre con pruebas:** Antes de considerar un módulo terminado, ejecutar las pruebas unitarias e integración descritas en la sección 3.9.3 del documento (PU-01 a PU-06).
5. **Priorizar Mobile-First:** RNF01 exige que todo el personal de la empresa pueda operar el sistema desde sus celulares sin realizar zoom.
