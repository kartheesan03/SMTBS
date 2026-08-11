FROM node:20-alpine

# Install native build tools required to compile sqlite3 from source on Alpine (musl libc)
RUN apk add --no-cache python3 make g++ sqlite-dev

WORKDIR /app
COPY package*.json ./

# npm ci uses package-lock.json for reproducible installs; postinstall will rebuild sqlite3 from source
RUN npm ci --omit=dev

COPY . .
EXPOSE 5000
CMD ["npm", "start"]
