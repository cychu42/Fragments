########## dependencies stage ##########
# A file for Docker Engine to create an image
FROM node:18.13.0-alpine3.17@sha256:fda98168118e5a8f4269efca4101ee51dd5c75c0fe56d8eb6fad80455c2f5827 AS dependencies

LABEL maintainer="Chen-Yuan Chu <cchu42@myseneca.ca>"
LABEL description="Fragments node.js microservice"

# Production environment
ENV NODE_ENV=production

# We default to use port 8080 in our service
ENV PORT=8080

# Reduce npm spam when installing within Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#loglevel
ENV NPM_CONFIG_LOGLEVEL=warn

# Disable colour when run inside Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#color
ENV NPM_CONFIG_COLOR=false

# Use /app as our working directory
WORKDIR /app

# Copy the package.json and package-lock.json files into /app
COPY package*.json /app/

# Install node production dependencies defined in package-lock.json
RUN npm ci --production



########## production stage ##########
FROM node:18.13.0-alpine3.17@sha256:fda98168118e5a8f4269efca4101ee51dd5c75c0fe56d8eb6fad80455c2f5827 AS production

# Use /app as our working directory
WORKDIR /app

# Copy package.json from dependencies stage and change ownership to node user
COPY --chown=node:node --from=dependencies \ 
    /app/package.json .

# Copy node_module from dependencies stage and change ownership to node user
COPY --chown=node:node --from=dependencies \ 
    /app/node_modules /app/node_modules 

# Copy our HTPASSWD file
COPY ./tests/.htpasswd ./tests/.htpasswd

# Copy src to /app/src/
COPY ./src ./src

# Switch to node user
USER node

# Start the container by running our server
# This runs node with the src folder, where the index.js is used as entry point
CMD ["node", "src"]

# We run our service on port 8080
EXPOSE 8080

# Health check
Healthcheck --interval=3m --timeout=30s --start-period=10s --retries=3 \
  CMD curl --fail localhost:8080 || exit 1
