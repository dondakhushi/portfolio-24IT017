
FROM node:22 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:22-alpine

WORKDIR /app

COPY --from=build /app/package*.json ./
RUN npm install --omit=dev

COPY --from=build /app/dist ./dist

RUN npm install -g vite

EXPOSE 5173

CMD ["vite", "preview", "--host", "0.0.0.0", "--port", "5173"]
