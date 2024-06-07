# Use the official Node.js image
FROM node:20.11.1
# Set the working directory inside the container
WORKDIR /app
# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Expose the port your application runs on
EXPOSE 3000