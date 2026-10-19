FROM node:22-alpine

WORKDIR /app

# Salin seluruh berkas backend (termasuk node_modules yang sudah terinstal agar mendukung mode offline/cepat)
COPY . .

# Jika node_modules belum ada, jalankan npm install
RUN if [ ! -d "node_modules" ]; then npm install --omit=dev; fi

EXPOSE 5000

CMD ["node", "server.js"]
