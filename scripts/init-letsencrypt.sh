#!/bin/bash
# ==============================================================================
# Production SSL Initialization Script for seller.vishalsingh.me
# Issues Let's Encrypt TLS Certificate via Certbot Webroot Challenge
# ==============================================================================

set -e

DOMAIN="seller.vishalsingh.me"
EMAIL="admin@vishalsingh.me"
COMPOSE_FILE="docker-compose.prod.yml"
DATA_PATH="./certbot_data"

echo "====================================================================="
echo " Starting TLS Certificate Setup for $DOMAIN"
echo "====================================================================="

# Check if docker compose is available
if ! command -v docker &> /dev/null; then
    echo "[ERROR] Docker is not installed or not in PATH."
    exit 1
fi

# Ensure Nginx configuration file is in place
if [ ! -f "nginx/default.conf" ]; then
    echo "[ERROR] nginx/default.conf not found."
    exit 1
fi

echo "1. Checking existing certificate status..."
# Check if real certificate already exists in certbot volume
EXISTS=$(docker compose -f $COMPOSE_FILE run --rm --entrypoint "sh -c 'test -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem && echo 1 || echo 0'" certbot 2>/dev/null || echo 0)

if [ "$EXISTS" = "1" ]; then
    echo " [INFO] Existing certificate found for $DOMAIN. Reloading Nginx..."
    docker compose -f $COMPOSE_FILE exec nginx nginx -s reload || true
    echo " Certificate is active and valid."
    exit 0
fi

echo "2. Creating temporary dummy certificate for Nginx startup..."
docker compose -f $COMPOSE_FILE run --rm --entrypoint "\
  sh -c 'mkdir -p /etc/letsencrypt/live/$DOMAIN && \
  openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
    -keyout /etc/letsencrypt/live/$DOMAIN/privkey.pem \
    -out /etc/letsencrypt/live/$DOMAIN/fullchain.pem \
    -subj \"/CN=localhost\"'" certbot

echo "3. Starting Nginx with dummy certificate..."
docker compose -f $COMPOSE_FILE up -d nginx

echo "4. Removing dummy certificate before requesting real certificate..."
docker compose -f $COMPOSE_FILE run --rm --entrypoint "\
  rm -Rf /etc/letsencrypt/live/$DOMAIN && \
  rm -Rf /etc/letsencrypt/archive/$DOMAIN && \
  rm -Rf /etc/letsencrypt/renewal/$DOMAIN.conf" certbot

echo "5. Requesting Let's Encrypt production certificate for $DOMAIN..."
docker compose -f $COMPOSE_FILE run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    --email $EMAIL \
    -d $DOMAIN \
    --rsa-key-size 4096 \
    --agree-tos \
    --no-eff-email \
    --force-renewal" certbot

echo "6. Reloading Nginx with the verified Let's Encrypt certificate..."
docker compose -f $COMPOSE_FILE exec nginx nginx -s reload

echo "====================================================================="
echo " [SUCCESS] TLS certificate successfully configured and active!"
echo " Visit: https://$DOMAIN/"
echo "====================================================================="
