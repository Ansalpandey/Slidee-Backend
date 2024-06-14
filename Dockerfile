FROM ubuntu

RUN apt-get update && apt-get install -y apt-transport-https
RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_20.x | bash -
RUN apt-get upgrade -y
RUN apt-get install -y nodejs

# Copy all files from the current directory
COPY . .

# (Optional) Set working directory (adjust path as needed)
# WORKDIR /app

RUN npm install

ENTRYPOINT [ "node", "index.js" ]
