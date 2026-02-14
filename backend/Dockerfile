FROM node:20-alpine


# 1. Set the working directory
WORKDIR /usr/src/app

# 2. Copy package files first
COPY package*.json ./

# 3. Install dependencies (Clean install)
RUN npm install

# 4. Copy the rest of your backend code
COPY . .

# 5. Expose the port
EXPOSE 5000

# 6. Start the app
CMD ["node", "server.js"]