#Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json .
RUN npm install
COPY tsconfig.json .
COPY src src
RUN npm run build

#Production stage
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=build /app/package*.json .
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist

EXPOSE 8080
ENV TZ="Asia/Bangkok"
CMD ["node", "dist/index.js"]