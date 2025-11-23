# Use official Node.js image as the base
FROM node:18-alpine

WORKDIR /usr/src/app

# Copy dependency files and install
COPY package*.json ./
RUN npm install

# Copy all source files
COPY . .

# Build TypeScript (outputs to dist)
RUN npm run build

# Expose the port your Express server uses (4000)
EXPOSE 4000

# Start the server (runs node dist/index.js)
CMD ["npm", "start"]
