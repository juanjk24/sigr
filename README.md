# Sistema Integral de Gestión de Restaurante (SIGR)

Sistema web orientado a la administración y operación de restaurantes, permitiendo gestionar pedidos, reservas, menú digital, usuarios, facturación y reportes desde una plataforma centralizada.

---

# Tabla de Contenido

- Descripción del Proyecto
- Tecnologías Utilizadas
- Arquitectura del Proyecto
- Estructura del Proyecto
- Requisitos Previos
- Instalación
- Variables de Entorno
- Ejecución del Proyecto
- Módulos del Sistema
- Control de Versiones
- Documentación
- Equipo de Desarrollo
- Licencia

---

# Descripción del Proyecto

SIGR (Sistema Integral de Gestión de Restaurante) es una aplicación web diseñada para optimizar la administración operativa de restaurantes mediante herramientas digitales que facilitan:

- Gestión de pedidos.
- Reservas de mesas.
- Administración del menú.
- Facturación.
- Reportes de ventas.
- Gestión de usuarios y roles.

El proyecto implementa una arquitectura modular basada en Screaming Architecture para mejorar la escalabilidad y mantenimiento del sistema.

---

# Tecnologías Utilizadas

## Backend
- Node.js
- Express
- TypeScript
- PostgreSQL
- Prisma ORM

## Frontend
- React
- Vite
- TypeScript

## Herramientas de Desarrollo
- Git
- GitHub
- GitHub Issues
- Jenkins (integración continua futura)

---

# Arquitectura del Proyecto

El sistema está dividido en dos partes principales:

```text
frontend/  -> Aplicación cliente desarrollada en React + Vite
backend/   -> API REST desarrollada con Express + TypeScript

El backend utiliza una arquitectura modular basada en dominios, donde cada módulo contiene sus propios controladores, servicios, rutas y validaciones.

# Estructura del Proyecto

```text
SIGR/
│
├── backend/
│   ├── src/
│   ├── prisma/
│   ├── tests/
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── vite.config.ts
│   └── README.md
│
├── CHANGELOG.md
├── LICENSE.txt
└── README.md

# Backend (Screaming Architecture)
El backend implementa una arquitectura modular basada en dominios.

Cada módulo contiene:
backend/src/modules/
│
├── auth/
├── users/
├── menu/
├── orders/
├── reservations/
├── billing/
└── reports/

#Frontend
El frontend está organizado por páginas, componentes y servicios.

frontend/src/
│
├── components/
├── pages/
├── services/
├── hooks/
├── context/
├── routes/
├── styles/
└── utils/

#Requisitos Previos

Antes de ejecutar el proyecto es necesario tener instalado:

- Node.js >= 20
- PostgreSQL >= 15
- Git
- npm

# Instalación

1. Clonar el repositorio
git clone https://github.com/equipoX/sigr.git

2. Ingresar al proyecto
cd sigr

3. Instalación del Backend
cd backend
npm install

4. Instalación del Frontend
cd frontend
npm install

#Variables de Entorno

Crear un archivo .env dentro de la carpeta backend.

Ejemplo:
PORT=3000
DATABASE_URL="postgresql://usuario:password@localhost:5432/sigr"
JWT_SECRET=secret_key

# Ejecución del Proyecto

Backend
cd backend
npm run dev

Servidor backend: http://localhost:3000

Frontend
cd frontend
npm run dev

Aplicación frontend: http://localhost:5173

# Módulos del Sistema
Autenticación
    - Inicio de sesión.
    - Registro de usuarios.
    - Gestión de roles.
Menú
    - CRUD de platos.
    - CRUD de categorías.
Pedidos
    - Registro de pedidos.
    - Seguimiento en tiempo real.
Reservas
    - Reservas por fecha y hora.
Facturación
    - Generación de facturas.
    - Cierre de caja.
Reportes
    - Reportes diarios de ventas.
    - Estadísticas operativas.

# Control de Versiones

El proyecto utiliza Git como sistema de control de versiones.

Rama principal estable: main

# Convención de commits

El proyecto utiliza Conventional Commits:

feat: nueva funcionalidad
fix: corrección de errores
docs: documentación
refactor: reorganización interna
test: pruebas
chore: tareas generales
build: configuración del proyecto

# Documentación

Documentos incluidos en la línea base:

README.md
LICENSE.txt

# Equipo de Desarrollo
Juan Cuellar

# Estado del Proyecto

Versión actual de línea base: v1.0.0-baseline

# Licencia

Este proyecto está licenciado bajo la licencia MIT.

Consultar el archivo: LICENSE.txt