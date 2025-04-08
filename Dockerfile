# Use an official nginx runtime as a parent image
FROM nginx:alpine

# Set the working directory to nginx asset directory
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy static assets from the current directory to the nginx directory
COPY index.html .
COPY style.css .
COPY script.js .

# Expose port 80 to the Docker host, so we can access the container
EXPOSE 80

# No need for an explicit CMD, the base nginx image handles starting the server. 