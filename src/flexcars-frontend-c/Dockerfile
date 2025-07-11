
# Build stage
FROM node:22 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps   
COPY . .
RUN npm run build 

# Production stage
FROM node:22
WORKDIR /app
COPY --from=builder /app .
EXPOSE 3000
CMD ["npm", "start"]