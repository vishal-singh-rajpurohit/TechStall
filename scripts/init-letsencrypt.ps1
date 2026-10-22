# ==============================================================================
# Production SSL Initialization Script for seller.vishalsingh.me (PowerShell)
# Issues Let's Encrypt TLS Certificate via Certbot Webroot Challenge
# ==============================================================================

$DOMAIN = "seller.vishalsingh.me"
$EMAIL = "admin@vishalsingh.me"
$COMPOSE_FILE = "docker-compose.prod.yml"

Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host " Starting TLS Certificate Setup for $DOMAIN" -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Cyan

# 1. Check existing cert
$exists = docker compose -f $COMPOSE_FILE run --rm --entrypoint "sh -c 'test -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem && echo 1 || echo 0'" certbot 2>$null

if ($exists -eq "1") {
    Write-Host " [INFO] Existing certificate found for $DOMAIN. Reloading Nginx..." -ForegroundColor Green
    docker compose -f $COMPOSE_FILE exec nginx nginx -s reload
    Write-Host " Certificate is active and valid." -ForegroundColor Green
    exit 0
}

Write-Host "2. Creating temporary dummy certificate for Nginx startup..." -ForegroundColor Yellow
docker compose -f $COMPOSE_FILE run --rm --entrypoint "sh -c 'mkdir -p /etc/letsencrypt/live/$DOMAIN && openssl req -x509 -nodes -newkey rsa:2048 -days 1 -keyout /etc/letsencrypt/live/$DOMAIN/privkey.pem -out /etc/letsencrypt/live/$DOMAIN/fullchain.pem -subj `/CN=localhost`'" certbot

Write-Host "3. Starting Nginx with dummy certificate..." -ForegroundColor Yellow
docker compose -f $COMPOSE_FILE up -d nginx

Write-Host "4. Removing dummy certificate before requesting real certificate..." -ForegroundColor Yellow
docker compose -f $COMPOSE_FILE run --rm --entrypoint "sh -c 'rm -Rf /etc/letsencrypt/live/$DOMAIN && rm -Rf /etc/letsencrypt/archive/$DOMAIN && rm -Rf /etc/letsencrypt/renewal/$DOMAIN.conf'" certbot

Write-Host "5. Requesting Let's Encrypt production certificate for $DOMAIN..." -ForegroundColor Yellow
docker compose -f $COMPOSE_FILE run --rm --entrypoint "certbot certonly --webroot -w /var/www/certbot --email $EMAIL -d $DOMAIN --rsa-key-size 4096 --agree-tos --no-eff-email --force-renewal" certbot

Write-Host "6. Reloading Nginx with verified certificate..." -ForegroundColor Yellow
docker compose -f $COMPOSE_FILE exec nginx nginx -s reload

Write-Host "=====================================================================" -ForegroundColor Green
Write-Host " [SUCCESS] TLS certificate successfully configured and active!" -ForegroundColor Green
Write-Host " Visit: https://$DOMAIN/" -ForegroundColor Green
Write-Host "=====================================================================" -ForegroundColor Green
