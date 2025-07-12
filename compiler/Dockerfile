# Use the Node.js 24 Alpine image as the base image
FROM node:24-alpine
ARG MONGODB_URL
# Set environment variables
ENV NODE_ENV=production \
    PORT=8000 \
    MONGODB_URL=${MONGODB_URL}

# Set the working directory inside the container
WORKDIR /app

# Install compilers and tools (needed at runtime for code execution)
RUN apk update && apk add --no-cache g++ openjdk11 python3 \
    && rm -rf /usr/share/man /usr/share/doc /usr/share/info /var/cache/apk/*

# Copy only package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Create necessary directories for code execution
RUN mkdir -p /app/judge/inputs /app/judge/outputs \
    /app/online-compiler/codes /app/online-compiler/inputs /app/online-compiler/outputs

# Set permissions
RUN chmod 755 /app/judge/inputs /app/judge/outputs \
    /app/online-compiler/codes /app/online-compiler/inputs /app/online-compiler/outputs

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Start the application
CMD ["node", "index.js"]
