FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
# npm 10 enforces peer deps strictly; swapcircle uses React 19 with
# packages that still peer on React 18, so allow legacy resolution.
RUN npm set legacy-peer-deps true && npm ci

FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
# Accept build arguments for NEXT_PUBLIC_* variables (fallback if .env.local doesn't exist)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
COPY --from=deps /app/node_modules ./node_modules
# Copy all files including .env.local if it exists
COPY . .
# Next.js will automatically read .env.local during build
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
EXPOSE 3000
CMD ["npm", "run", "start", "--", "-H", "0.0.0.0", "-p", "3000"]
