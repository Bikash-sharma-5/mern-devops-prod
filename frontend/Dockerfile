# --- Stage 1: Build the React App ---
FROM node:18-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# --- Stage 2: Serve with Nginx ---
FROM nginx:stable-alpine

# Copy the build output from the previous stage to Nginx
COPY --from=build-stage /app/build /usr/share/nginx/html

# Expose port 80 for the web traffic
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]