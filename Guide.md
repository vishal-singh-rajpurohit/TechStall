# Complete DevOps Guide: GitHub Actions CI/CD, AWS EC2 Ubuntu, Docker & Let's Encrypt SSL

Welcome to the definitive deployment and operations guide for the **Semantic E-Commerce** platform. This guide explains how the GitHub Actions continuous integration and deployment (CI/CD) workflow operates, how to provision and configure an AWS EC2 Ubuntu server, how to map your domain DNS, how to issue production TLS/SSL certificates with Certbot, and how to automate zero-downtime updates.

---

## Table of Contents

1. [Architectural Overview](#1-architectural-overview)
2. [Understanding the GitHub Actions Workflow (`ci.yml`)](#2-understanding-the-github-actions-workflow-ciyml)
3. [Step-by-Step Git & GitHub Setup](#3-step-by-step-git--github-setup)
4. [AWS EC2 Ubuntu Server Provisioning & Configuration](#4-aws-ec2-ubuntu-server-provisioning--configuration)
5. [Domain & DNS Configuration (`seller.vishalsingh.me`)](#5-domain--dns-configuration-sellervishalsinghme)
6. [SSL / TLS Certificate Setup with Certbot & Nginx](#6-ssl--tls-certificate-setup-with-certbot--nginx)
7. [Automated Continuous Deployment (CD) Setup](#7-automated-continuous-deployment-cd-setup)
8. [Day-2 Operations, Monitoring & Troubleshooting](#8-day-2-operations-monitoring--troubleshooting)

---

## 1. Architectural Overview

```
 [ Local Dev Machine ]
          |
          | git push origin main
          v
+---------------------------------------------------------------------------------+
|                                 GitHub Cloud                                    |
|                                                                                 |
|   +-----------------------+      +--------------------+      +--------------+   |
|   | Job 1: Lint & Validate| ---> | Job 2: Build Images| ---> | Job 3: Deploy|   |
|   | Next.js, Python, Nginx|      | Multi-Stage Buildx |      | SSH to EC2   |   |
|   +-----------------------+      +--------------------+      +-------+------+   |
+----------------------------------------------------------------------|----------+
                                                                       | SSH (Port 22)
                                                                       v
+---------------------------------------------------------------------------------+
|                       AWS EC2 Ubuntu Server (Static Elastic IP)                 |
|                                                                                 |
|                        Inbound Ports: 80 (HTTP) & 443 (HTTPS)                   |
|                                          |                                      |
|                                          v                                      |
|                 +-------------------------------------------------+             |
|                 |             Nginx Reverse Proxy & TLS           |             |
|                 |                 (Container: nginx)              |             |
|                 +------------------------+------------------------+             |
|                                          |                                      |
|      +-----------------------------------+-----------------------------------+  |
|      |                                   |                                   |  |
|      | Path: /                           | Path: /admin/                     |  |
|      v                                   v                                   v  |
| +------------------------+  +---------------------------+  +------------------+ |
| |   frontend (Next.js)   |  | seller_dashboard (Next.js)|  | backend (FastAPI)| |
| |   Internal Port 3000   |  |     Internal Port 3001    |  |  Internal 8000   | |
| | (Customer Storefront)  |  |   (basePath: "/admin")    |  | (/api/v1/...,docs| |
| +-----------+------------+  +-------------+-------------+  +--------+---------+ |
|             |                             |                         |           |
|             +-----------------------------+-------------------------+           |
|                                           |                                     |
|                                           v                                     |
|                             +---------------------------+                       |
|                             | postgres_vector (Postgres)|                       |
|                             |    Internal Port 5432     |                       |
|                             | (semantic_ecommerce DB)   |                       |
|                             +---------------------------+                       |
|                                                                                 |
|                     +---------------------------------------+                   |
|                     | certbot (SSL Auto-Renewal Daemon 12h) |                   |
|                     +---------------------------------------+                   |
+---------------------------------------------------------------------------------+
```

### URL Routing Contract
- **Storefront**: `https://seller.vishalsingh.me/` → Proxied internally to `frontend:3000`.
- **Merchant / Admin Dashboard**: `https://seller.vishalsingh.me/admin/` → Proxied internally to `seller_dashboard:3001` (with `basePath: "/admin"`).
- **REST API Gateway**: `https://seller.vishalsingh.me/api/` → Proxied internally to `backend:8000` (preserving `/api/v1/...`, `/api/health`, and `/api/docs`).
- **Internal Database**: `postgres_vector:5432` → Restricted to internal Docker network `semantic_net_prod`, never exposed to the public internet.

---

## 2. Understanding the GitHub Actions Workflow (`ci.yml`)

The GitHub Actions configuration is located in [`.github/workflows/ci.yml`](file:///d:/Projects/Semantic%20E-commerce/.github/workflows/ci.yml). It is divided into three sequential, isolated jobs:

### Job 1: `lint-and-validate` (Quality Gate)
- **Triggers**: On every `push` and `pull_request` to `main` or `master`, plus manual triggers.
- **Actions**:
  1. Sets up **Node.js 20** and **Python 3.12** with dependency package caching (`npm` and `pip`).
  2. Runs `docker compose config` against all compose files (`docker-compose.yml`, `docker-compose.prod.yml`, `docker-compose.dev.yml`) to guarantee zero YAML or environment variable syntax errors.
  3. Spins up a lightweight `nginx:alpine` container to test `nginx -t` against the Nginx reverse proxy configuration.
  4. Runs `npm run lint` inside both `Frontend` and `Seller_dahsboard`.
  5. Compiles Python source code (`python -m compileall src/`) to prevent runtime syntax bugs.

### Job 2: `build-images` (Docker Build Verification)
- **Runs After**: `lint-and-validate` completes successfully.
- **Actions**:
  1. Uses `docker/setup-buildx-action` with Docker BuildKit.
  2. Builds the multi-stage images for `backend`, `frontend`, and `seller_dashboard`.
  3. Utilizes GitHub Actions Cache (`type=gha`) to save layers across runs, reducing build times from minutes to seconds.
  4. Verifies Next.js standalone outputs and inlines production build arguments (`NEXT_PUBLIC_API_URL`, etc.).

### Job 3: `deploy-aws` (Continuous Deployment)
- **Runs After**: `build-images` succeeds.
- **Condition**: Only triggers on direct pushes or merges to the `main` branch.
- **Actions**:
  1. Opens a secure SSH session to your AWS EC2 Ubuntu instance using the `appleboy/ssh-action`.
  2. Pulls the latest commits (`git fetch --all && git reset --hard origin/main`).
  3. Writes production environment variables from GitHub Secrets (`PROD_ENV_FILE`).
  4. Executes `docker compose -f docker-compose.prod.yml up -d --build`.
  5. Prunes dangling Docker images (`docker image prune -f`) to save server disk space.
  6. Verifies container health with `docker compose ps`.

---

## 3. Step-by-Step Git & GitHub Setup

### Step 3.1: Initialize Git Repository
In your project root (`D:\Projects\Semantic E-commerce`):

```bash
# Check if git is initialized
git status

# If not initialized:
git init
git branch -M main
```

### Step 3.2: Verify `.gitignore`
Make sure secrets and dependencies are ignored before committing. Verify your `.gitignore` includes:
```gitignore
node_modules/
.next/
__pycache__/
*.pyc
.env
.env.local
.env.*.local
certbot_data/
```

### Step 3.3: Add Remote & Push to GitHub
1. Create a new repository on [GitHub](https://github.com/new) (e.g. `semantic-ecommerce`).
2. Link your local repository and push:
```bash
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/semantic-ecommerce.git
git add .
git commit -m "feat: configure production Nginx reverse proxy, Docker stack, and CI/CD workflow"
git push -u origin main
```

### Step 3.4: Configure GitHub Repository Secrets
Navigate to: **GitHub Repository → Settings → Secrets and variables → Actions → New repository secret**

Add the following secrets:

| Secret Name | Example Value | Description |
|-------------|---------------|-------------|
| `EC2_HOST` | `54.210.120.45` | Public IPv4 / Elastic IP of your AWS EC2 instance |
| `EC2_USERNAME` | `ubuntu` | Default Ubuntu SSH username |
| `EC2_SSH_KEY` | `-----BEGIN OPENSSH PRIVATE KEY-----...` | Private SSH key (`.pem`) used to authenticate with EC2 |
| `EC2_PROJECT_PATH` | `/home/ubuntu/semantic-ecommerce` | Absolute path where the repo is cloned on EC2 |
| `PROD_ENV_FILE` | *(Content of `.env.docker.prod`)* | Production environment file containing your database and API secrets |

---

## 4. AWS EC2 Ubuntu Server Provisioning & Configuration

### Step 4.1: Launch an AWS EC2 Instance
1. Open the [AWS EC2 Console](https://console.aws.amazon.com/ec2/).
2. Click **Launch Instance**:
   - **Name**: `semantic-ecommerce-prod`
   - **OS Image**: **Ubuntu Server 24.04 LTS (HVM), SSD Volume Type** (64-bit x86).
   - **Instance Type**: **`t3.medium`** (2 vCPU, 4 GiB RAM) recommended. Next.js multi-app compilation requires at least 2GB of RAM. *(A `t3.small` can be used if you configure 4GB of SWAP space).*
   - **Key pair**: Create a new key pair (e.g. `semantic-key.pem`) and download it.
   - **Storage**: Minimum **25 GiB** gp3 SSD.

### Step 4.2: Configure AWS Security Group
Configure Inbound Security Group Rules to allow SSH, HTTP, and HTTPS:

| Type | Protocol | Port Range | Source | Purpose |
|------|----------|------------|--------|---------|
| **SSH** | TCP | `22` | `My IP` (or `0.0.0.0/0`) | Secure terminal access |
| **HTTP** | TCP | `80` | `0.0.0.0/0` | Web traffic & Certbot ACME validation |
| **HTTPS** | TCP | `443` | `0.0.0.0/0` | Secure encrypted web traffic |

> [!IMPORTANT]
> Do **NOT** open ports `3000`, `3001`, `8000`, or `5432` in the AWS Security Group. All application traffic must pass strictly through Nginx on ports `80` and `443`.

### Step 4.3: Allocate and Associate an Elastic IP
1. In the EC2 sidebar, go to **Network & Security → Elastic IPs**.
2. Click **Allocate Elastic IP address** → **Allocate**.
3. Select the allocated Elastic IP → **Actions → Associate Elastic IP address**.
4. Choose your `semantic-ecommerce-prod` instance and click **Associate**.
*(This provides a permanent public IPv4 address that does not change when the instance restarts).*

### Step 4.4: Connect via SSH
From your local terminal (macOS/Linux) or PowerShell (Windows):

```bash
# Set strict permissions on your private key (Linux/macOS)
chmod 400 semantic-key.pem

# Connect to EC2
ssh -i semantic-key.pem ubuntu@<YOUR_ELASTIC_IP>
```

### Step 4.5: Install Docker Engine & Docker Compose on Ubuntu
Run the following script on your Ubuntu EC2 instance to install the official Docker repository:

```bash
# 1. Update system packages
sudo apt update && sudo apt upgrade -y

# 2. Install prerequisites
sudo apt install -y ca-certificates curl gnupg lsb-release

# 3. Add Docker official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# 4. Set up the Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 5. Install Docker Engine, CLI, and Docker Compose plugin
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 6. Allow the ubuntu user to run Docker without sudo
sudo usermod -aG docker ubuntu

# 7. Apply the group changes immediately
newgrp docker

# 8. Verify installation
docker --version
docker compose version
```

### Step 4.6: Configure 4GB SWAP Space (Prevents Next.js Out-Of-Memory)
Compiling two Next.js standalone applications simultaneously can spike memory usage. Add a 4GB swapfile:

```bash
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make swap permanent across reboots
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Verify swap is active
free -h
```

### Step 4.7: Clone Project to EC2
On the EC2 server:

```bash
cd /home/ubuntu
git clone https://github.com/<YOUR_GITHUB_USERNAME>/semantic-ecommerce.git
cd semantic-ecommerce
```

---

## 5. Domain & DNS Configuration (`seller.vishalsingh.me`)

To obtain a valid Let's Encrypt SSL certificate, `seller.vishalsingh.me` must resolve to your EC2 Elastic IP address.

### Step 5.1: Add DNS A Record
Log in to your DNS provider (Cloudflare, Namecheap, GoDaddy, Route53, Hostinger):

1. Navigate to DNS Management for `vishalsingh.me`.
2. Add a new record:
   - **Type**: `A`
   - **Name / Host**: `seller` (creates `seller.vishalsingh.me`)
   - **Value / IPv4 Address**: `<YOUR_EC2_ELASTIC_IP>`
   - **TTL**: `Auto` or `300 seconds`
   - **Proxy Status** *(if using Cloudflare)*: **DNS Only (Grey Cloud)** during initial certificate generation. *(You can re-enable the Orange Cloud proxy later if desired).*

### Step 5.2: Verify DNS Resolution
From your local terminal or EC2 instance, run:

```bash
# Check with dig
dig +short seller.vishalsingh.me A

# Or check with nslookup
nslookup seller.vishalsingh.me
```

Ensure the output matches your EC2 Elastic IP before proceeding to Step 6.

---

## 6. SSL / TLS Certificate Setup with Certbot & Nginx

### How the ACME HTTP-01 Challenge Works
Let's Encrypt requires proof that you control `seller.vishalsingh.me`.
1. Certbot requests a verification token from Let's Encrypt.
2. Let's Encrypt sends an HTTP request to `http://seller.vishalsingh.me/.well-known/acme-challenge/<TOKEN>`.
3. Nginx serves this path from the shared Docker volume `/var/www/certbot`.
4. Let's Encrypt validates the token and issues the signed certificate into `/etc/letsencrypt/live/seller.vishalsingh.me/`.

### Step 6.1: Run the Automated Certificate Bootstrap Script
The project includes an automated script [`scripts/init-letsencrypt.sh`](file:///d:/Projects/Semantic%20E-commerce/scripts/init-letsencrypt.sh) that solves the chicken-and-egg problem (Nginx requiring SSL certificates before it can start):

On your EC2 instance:
```bash
cd /home/ubuntu/semantic-ecommerce

# Make script executable
chmod +x scripts/init-letsencrypt.sh

# Run the bootstrap script
./scripts/init-letsencrypt.sh
```

**What the script does automatically:**
1. Generates a temporary self-signed certificate so Nginx can start without configuration errors.
2. Starts Nginx on ports `80` and `443`.
3. Removes the temporary certificate and executes Certbot via Docker to request the real 4096-bit RSA Let's Encrypt certificate.
4. Reloads Nginx gracefully with zero downtime.

### Step 6.2: Verify Automated SSL Renewal
The `certbot` container in `docker-compose.prod.yml` runs a lightweight renewal loop every 12 hours.
To test that renewals will succeed automatically in the future, run:

```bash
docker compose -f docker-compose.prod.yml run --rm certbot renew --dry-run
```

If you see `The dry run was successful`, automatic renewals are fully operational!

---

## 7. Automated Continuous Deployment (CD) Setup

With the server running and SSL certificates active, you can now connect GitHub Actions for automated continuous deployment.

### Step 7.1: Generate an SSH Key Pair for GitHub Actions
On your local computer (or on the server):

```bash
# Generate dedicated deploy key (press Enter for no passphrase)
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ./deploy_key
```

This creates:
- `deploy_key` (Private key — goes into GitHub Secrets).
- `deploy_key.pub` (Public key — goes onto the EC2 server).

### Step 7.2: Add Public Key to EC2
On your EC2 server:

```bash
# Append public key to authorized_keys
echo "<PASTE_CONTENTS_OF_deploy_key.pub>" >> ~/.ssh/authorized_keys

# Ensure correct permissions
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### Step 7.3: Add Private Key to GitHub Secrets
1. Open the file `deploy_key` on your local machine and copy its entire content (including `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----`).
2. Go to your GitHub repository: **Settings → Secrets and variables → Actions**.
3. Create the secret `EC2_SSH_KEY` and paste the private key.
4. Create the secret `EC2_HOST` with your EC2 Elastic IP.
5. Create the secret `EC2_USERNAME` with `ubuntu`.
6. Create the secret `PROD_ENV_FILE` with the contents of your [`.env.docker.prod`](file:///d:/Projects/Semantic%20E-commerce/.env.docker.prod) file.

### Step 7.4: Test the Automated Pipeline
Push any change to the `main` branch:

```bash
git add .
git commit -m "ci: trigger automated production deployment"
git push origin main
```

Go to the **Actions** tab on your GitHub repository. You will see:
1. `Lint & Configuration Validation` runs and passes.
2. `Build Docker Images` compiles all multi-stage containers.
3. `Deploy to AWS EC2 Ubuntu` connects via SSH, pulls latest code, rebuilds containers, and verifies application health!

---

## 8. Day-2 Operations, Monitoring & Troubleshooting

### Essential Operational Commands

```bash
# View live container status
docker compose -f docker-compose.prod.yml ps

# View live system resource usage (RAM/CPU)
docker stats

# Stream all service logs
docker compose -f docker-compose.prod.yml logs -f

# Stream Nginx access and error logs
docker compose -f docker-compose.prod.yml logs -f nginx

# Stream backend API logs
docker compose -f docker-compose.prod.yml logs -f backend

# Reload Nginx configuration without dropping active connections
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload

# Restart a specific service (e.g. backend)
docker compose -f docker-compose.prod.yml restart backend
```

### Database Backup & Restore

```bash
# 1. Take a live database dump
docker exec -t semantic_pgvector_prod pg_dump -U postgres -d semantic_ecommerce > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Restore database dump
cat backup.sql | docker exec -i semantic_pgvector_prod psql -U postgres -d semantic_ecommerce
```

### Troubleshooting Playbook

#### Issue 1: `bind: address already in use` on Port 80 or 443
**Cause**: Ubuntu might have a default `apache2` or standalone `nginx` service running on the host.
**Fix**:
```bash
sudo systemctl stop apache2 && sudo systemctl disable apache2 2>/dev/null || true
sudo systemctl stop nginx && sudo systemctl disable nginx 2>/dev/null || true
```

#### Issue 2: Certbot Fails with `Connection refused` or `Timeout during connect`
**Cause**: Port `80` is blocked by the AWS Security Group or DNS has not propagated yet.
**Fix**:
1. Verify AWS Security Group has Inbound rule: `HTTP`, Port `80`, Source `0.0.0.0/0`.
2. Check Ubuntu UFW: `sudo ufw allow 80/tcp && sudo ufw reload`.
3. Check DNS resolution: `dig +short seller.vishalsingh.me A`. Must match your Elastic IP.

#### Issue 3: Next.js Build Fails with `JavaScript heap out of memory`
**Cause**: Next.js ran out of RAM compiling static routes on a 1GB/2GB instance.
**Fix**: Verify your 4GB swap space is enabled (`free -h`). If not, re-run Step 4.6.

#### Issue 4: NextAuth Redirects Back to `/admin/login` After Successful Sign In
**Cause**: `NEXTAUTH_URL` or cookie paths mismatch.
**Fix**: Ensure `SELLER_NEXTAUTH_URL=https://seller.vishalsingh.me/admin/api/auth` is set in `.env.docker.prod`.

---

## Verification Checklist

- [x] Nginx reverse proxy routing `/` to Storefront (`:3000`), `/admin/` to Seller Dashboard (`:3001`), `/api/` to FastAPI (`:8000`).
- [x] Host port mappings removed from Postgres, FastAPI, and Next.js internal containers.
- [x] Multi-stage standalone Dockerfiles for frontend and dashboard.
- [x] NextAuth dedicated session cookies (`seller.session-token`) scoped to `/admin`.
- [x] CI/CD workflow [`.github/workflows/ci.yml`](file:///d:/Projects/Semantic%20E-commerce/.github/workflows/ci.yml) validated.
- [x] Automated Let's Encrypt SSL script [`scripts/init-letsencrypt.sh`](file:///d:/Projects/Semantic%20E-commerce/scripts/init-letsencrypt.sh) ready.
- [x] Complete production guide [`Guide.md`](file:///d:/Projects/Semantic%20E-commerce/Guide.md) created.
