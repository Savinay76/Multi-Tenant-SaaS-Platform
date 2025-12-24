FROM node:18

RUN apt-get update && apt-get install -y postgresql-client

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 5000
CMD ["sh", "start.sh"]
