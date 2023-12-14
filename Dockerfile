
FROM nginx


RUN echo " \
user  nginx; \
worker_processes  1;\
\
events { \
    worker_connections  1024; \
    } \
    \
    http { \
    include       /etc/nginx/mime.types; \
    default_type  application/octet-stream; \
    \
\
    add_header 'Cross-Origin-Opener-Policy' 'unsafe-none';\
    add_header 'Cross-Origin-Embedder-Policy' 'unsafe-none';\
    add_header 'Cross-Origin-Resource-Policy' 'cross-origin';\
    \
    # Outras configurações do NGINX, se necessário \
    \
    server { \
\
    listen       80; \
    server_name  localhost; \
    \
    location / { \
    root   /usr/share/nginx/html; \
    index  index.html index.htm; \
    } \
    \
\
    } \
    }" > /etc/nginx/nginx.conf


COPY . /usr/share/nginx/html