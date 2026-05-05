FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ENV GO_API_URL=http://go-api:8080
ENV NEXT_PUBLIC_APP_NAME="Planet Motor BMW"
ENV NEXT_PUBLIC_APP_URL=http://localhost:3000

RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json .
COPY --from=builder /app/public ./public

ENV NODE_ENV=production
ENV GO_API_URL=http://go-api:8080
ENV NEXT_PUBLIC_APP_NAME="Planet Motor BMW"
ENV NEXT_PUBLIC_APP_URL=http://localhost:3000

EXPOSE 3000

CMD ["npm", "start"]
