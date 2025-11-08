FROM node:18-alpine AS base
WORKDIR /app

# Copy package.json & package-lock.json (jika ada)
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy seluruh source
COPY . .

# Expose port
EXPOSE 4000

# Start server
CMD ["npm", "run", "start"]
