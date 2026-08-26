FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Workaround for pdf-parse debug check bug in ESM environments
RUN mkdir -p test/data && cp node_modules/pdf-parse/test/data/05-versions-space.pdf test/data/05-versions-space.pdf

# Copy application source code
COPY . .

# Expose the port from backend environment (port 3000)
EXPOSE 3000

# Run the app
CMD ["node", "server.js"]
