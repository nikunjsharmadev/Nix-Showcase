# FROM node:20-alpine
# WORKDIR /app
# COPY package*.json ./
# RUN npm ci
# COPY . .
# CMD ["npm", "run", "dev"]
# EXPOSE 5000

# PRODUCTION

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "run", "start"]