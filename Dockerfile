FROM node:20-slim

# Ghostscript 설치 (PDF 압축용)
RUN apt-get update && apt-get install -y --no-install-recommends ghostscript && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

RUN mkdir -p uploads

EXPOSE 3000

CMD ["node", "server.js"]
