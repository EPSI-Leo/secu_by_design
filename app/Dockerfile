FROM node:20-alpine

WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev   # ← utilise npm install plutôt que npm ci

COPY . .
EXPOSE 3000
CMD ["node", "index.js"]
