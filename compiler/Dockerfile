# Use the Node.js 24 Alpine image as the base image
FROM node:24-alpine
# Set the working directory inside the container
WORKDIR /app
# Install required compilers and tools
RUN apk update && apk add --no-cache g++ gcc openjdk11 python3  \
    && rm -rf /var/cache/apk/*

# Copy only the package.json and package-lock.json files and install dependencies.
# This allows Docker to cache this layer when package files don't change.
COPY package*.json ./
RUN npm install

# Create necessary directories for code execution
RUN mkdir -p /app/judge/inputs /app/judge/outputs \
    /app/online-compiler/codes /app/online-compiler/inputs /app/online-compiler/outputs

# Set proper permissions for code execution directories
RUN chmod 755 /app/judge/inputs /app/judge/outputs \
    /app/online-compiler/codes /app/online-compiler/inputs /app/online-compiler/outputs

# Copy application code
COPY . .


# Expose port
EXPOSE 8000

# Start the application
CMD ["node", "index.js"]
