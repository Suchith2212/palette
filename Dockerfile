FROM node:22-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
ARG VITE_API_ORIGIN=
ENV VITE_API_ORIGIN=$VITE_API_ORIGIN
RUN npm run build

FROM node:22-alpine AS server-build
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/ ./
RUN npm run build

FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev
COPY --from=server-build /app/server/dist ./server/dist
COPY server/uploads ./server/uploads
COPY --from=client-build /app/client/dist ./client/dist
WORKDIR /app/server
EXPOSE 3000
CMD ["node", "dist/index.js"]
