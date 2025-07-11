# Build stage
FROM node:22 AS builder
WORKDIR /app

# Add build arguments for env variables
ARG NEXT_PUBLIC_API_URL
ARG NEXTAUTH_SECRET

COPY package*.json ./
RUN npm install --legacy-peer-deps   
COPY . .

# Set env variables for build time
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET

RUN npm run build

# Production stage
FROM node:22
WORKDIR /app
COPY --from=builder /app .

# Set env variables for runtime (for SSR/API routes)
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET

EXPOSE 3000
CMD ["npm", "start"]