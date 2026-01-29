FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build || true
EXPOSE 3002
CMD ["npm", "run", "dev", "--", "-p", "3002", "-H", "0.0.0.0"]
