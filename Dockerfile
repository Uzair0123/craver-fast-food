# 1. BASE Layer: Minimal production web server
FROM nginx:alpine

# 2. Set the web root where Nginx server files 
WORKDIR /usr/share/nginx/html

# 3. Clean out default Nginx placeholder files
RUN rm -rf ./*

# 4. BULK COPY: Copy all your restaurant files & folders in ONE shot!
COPY . .

# 5. Document that Nginx listens on port 80
EXPOSE 80

# 6. Start the web server as PID 1
CMD ["nginx","-g", "daemon off;"]

