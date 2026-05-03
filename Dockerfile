FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY backend/package*.json ./backend/
RUN npm install && npm install --workspace backend
COPY . .
WORKDIR /app/backend
EXPOSE 4000
CMD ["npm","start"]
