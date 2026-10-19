FROM nginx:stable-alpine

# Salin konfigurasi reverse proxy & SPA Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Salin hasil build produksi React (dist)
COPY dist /usr/share/nginx/html

EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]
