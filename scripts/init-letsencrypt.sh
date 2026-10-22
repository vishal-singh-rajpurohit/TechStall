#!/bin/bash
# ==============================================================================
# Production SSL Initialization Script for seller.vishalsingh.me
# Issues Let's Encrypt TLS Certificate via Certbot Webroot Challenge
# ==============================================================================

set -e

DOMAIN="seller.vishalsingh.me"
EMAIL="admin@vishalsingh.me"
COMPOSE_FILE="docker-compose.prod.yml"

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
IS_LETSENCRYPT=$(docker compose -f $COMPOSE_FILE run --rm --entrypoint \
  "sh -c 'openssl x509 -in /etc/letsencrypt/live/$DOMAIN/fullchain.pem -issuer -noout 2>/dev/null | grep -i \"Let.s Encrypt\" || true'" certbot 2>/dev/null || true)

if [ -n "$IS_LETSENCRYPT" ]; then
    echo " [INFO] Active Let's Encrypt certificate found for $DOMAIN. Reloading Nginx..."
    docker compose -f $COMPOSE_FILE exec nginx nginx -s reload || true
    echo " Certificate is active and valid."
    exit 0
fi

echo "2. Ensuring certificate path exists (dummy bootstrap if needed)..."
docker compose -f $COMPOSE_FILE run --rm --entrypoint "\
  sh -c 'if [ ! -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem ]; then \
    mkdir -p /etc/letsencrypt/live/$DOMAIN && \
    openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
      -keyout /etc/letsencrypt/live/$DOMAIN/privkey.pem \
      -out /etc/letsencrypt/live/$DOMAIN/fullchain.pem \
      -subj \"/CN=localhost\"; \
  fi'" certbot

echo "3. Starting Nginx..."
docker compose -f $COMPOSE_FILE up -d nginx

echo "4. Requesting Let's Encrypt production certificate for $DOMAIN..."
docker compose -f $COMPOSE_FILE run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    --cert-name $DOMAIN \
    --email $EMAIL \
    -d $DOMAIN \
    --agree-tos \
    --no-eff-email \
    --non-interactive \
    --force-renewal" certbot

echo "5. Reloading Nginx with the verified Let's Encrypt certificate..."
docker compose -f $COMPOSE_FILE exec nginx nginx -s reload

echo "====================================================================="
echo " [SUCCESS] TLS certificate successfully configured and active!"
echo " Visit: https://$DOMAIN/"
echo "====================================================================="
