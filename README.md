# Flexcars AWS – Monorepo

Flexcars AWS is a monorepo for a full-stack car rental platform, including backend (NestJS, Prisma), multiple frontend apps (Next.js), and infrastructure (Docker, Kubernetes).

## Table of Contents
- [Project Structure](#project-structure)
- [Backend](#backend)
- [Frontend](#frontend)
- [Development Setup](#development-setup)
- [Docker & Kubernetes](#docker--kubernetes)
- [Database & Prisma](#database--prisma)
- [Environment Variables](#environment-variables)
- [Testing](#testing)
- [Deployment](#deployment)

---

## Project Structure
```
flexcars-aws/
├── docker-compose.yml
├── k8s/                # Kubernetes manifests
├── src/
│   ├── flexcars-backend/      # NestJS API (TypeScript, Prisma)
│   ├── flexcars-frontend/     # Next.js Frontend (TypeScript)
│   └── flexcars-frontend-c/   # Next.js Frontend (TypeScript, variant)
```

## Backend
- **Framework:** [NestJS](https://nestjs.com/) (TypeScript)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Features:** Auth (JWT, Google), Users, Companies, Vehicles, Reservations, Payments, Incidents, Notifications, Maintenance, Rental Contracts, Invoices, Car Sitters, etc.
- **API Docs:** Swagger available at `/api` when running the backend.
- **Location:** `src/flexcars-backend/`

### Backend Setup
```bash
cd src/flexcars-backend
npm install
# Set up your .env (see below)
npm run prisma:generate   # or npx prisma generate
npm run start:dev
```

## Frontend
- **Framework:** [Next.js](https://nextjs.org/) (TypeScript)
- **UI:** [Mantine](https://mantine.dev/)
- **Location:** 
  - `src/flexcars-frontend/`
  - `src/flexcars-frontend-c/`

### Frontend Setup
```bash
cd src/flexcars-frontend
npm install
npm run dev
# or for the C variant
cd ../flexcars-frontend-c
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development Setup
1. **Clone the repo:**  
   `git clone <repo-url>`
2. **Install dependencies** for each app (see above).
3. **Set up environment variables** (see below).
4. **Start services** (backend, frontend, database).

## Docker & Kubernetes
- **Docker Compose:**  
  Use `docker-compose.yml` at the root to run backend, frontend, and Postgres locally.
  ```bash
  docker-compose up --build
  ```
- **Kubernetes:**  
  Manifests in `k8s/` for deploying to a K8s cluster (backend, frontend, Postgres, ingress, secrets).

## Database & Prisma
- **Database:** PostgreSQL (default: `localhost:5555`)
- **Prisma:**  
  - Schema: `src/flexcars-backend/prisma/schema.prisma`
  - Migrations: `src/flexcars-backend/prisma/migrations/`
  - Faker/seed: `src/flexcars-backend/prisma/faker/seed.ts`
  - Commands:
    ```bash
    npx prisma migrate dev
    npx prisma studio
    npm run seed
    ```

## Environment Variables
Create a `.env` file in each app as needed. Example for backend:
```
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=chat-websocket
DATABASE_URL="postgresql://postgres:postgres@localhost:5555/chat-websocket?schema=public"
JWT_SECRET=changeMe
```
Frontend apps may require:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXTAUTH_SECRET=your_secret
```

## Testing
**Backend:**
```bash
npm run test         # unit tests
npm run test:e2e     # end-to-end tests
npm run test:cov     # coverage
```

## Deployment
- **Backend:** See [NestJS deployment docs](https://docs.nestjs.com/deployment) or use Docker/K8s manifests.
- **Frontend:** Deployable to Vercel or any Node.js host.
- **Kubernetes:** Use manifests in `k8s/`.

---

## Credits
- Main author: Justin Katasi
- Built with [NestJS](https://nestjs.com/) and [Next.js](https://nextjs.org/)
