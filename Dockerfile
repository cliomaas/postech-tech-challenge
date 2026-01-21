FROM node:20-alpine

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm --prefix apps/mfe-dashboard install
RUN npm --prefix apps/mfe-transactions install

EXPOSE 3000 4000 6006 9101 9102

CMD ["npm", "run", "dev:all"]
