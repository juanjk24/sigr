# Changelog

Todos los cambios importantes del proyecto SIGR serán documentados en este archivo.

El formato está basado en Keep a Changelog y el proyecto utiliza Conventional Commits.

---

# [1.0.0-baseline] - 2026-05-16

Primera línea base estable del Sistema Integral de Gestión de Restaurante (SIGR).

## Agregado

### Backend
- Configuración inicial de Express con TypeScript.
- Configuración de PostgreSQL mediante Prisma ORM.
- Implementación de arquitectura Screaming Architecture.
- Creación de módulos:
  - Auth
  - Users
  - Menu
  - Orders
  - Reservations
  - Billing
  - Reports
- Configuración de middlewares globales.
- Estructura inicial de pruebas unitarias e integración.

### Frontend
- Configuración inicial de React con Vite.
- Organización modular de páginas y componentes.
- Creación de páginas:
  - Login
  - Dashboard
  - Menu
  - Orders
  - Reservations
  - Billing
  - Reports

### Documentación
- Creación de README.md.
- Creación de LICENSE.txt.
- Creación de deployment-guide.md.
- Creación de database-schema.md.

---

## Estructura Establecida

- Definición de convenciones de carpetas.
- Definición de estructura modular.
- Separación frontend/backend.
- Configuración inicial de control de versiones con Git.

---

## Herramientas Integradas

- Git
- GitHub
- GitHub Issues
- Prisma ORM
- TypeScript
- React
- Vite
- PostgreSQL

---

## Estado de la Línea Base

### Validaciones realizadas
- Estructura inicial completada.
- Configuración de dependencias validada.
- Módulos organizados correctamente.
- Arquitectura establecida satisfactoriamente.

---

# Convenciones de Versionado

El proyecto utiliza versionado semántico:

```text
MAJOR.MINOR.PATCH