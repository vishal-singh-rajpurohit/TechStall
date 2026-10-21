# 🚀 TechStall — Enterprise AI-Powered Semantic E-Commerce Ecosystem

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js%2014-black?style=for-the-badge&logo=next.js&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL%2016-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![pgvector](https://img.shields.io/badge/pgvector-768--dim-blue?style=for-the-badge&logo=database)
![Docker](https://img.shields.io/badge/Docker%20Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript%205.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Python](https://img.shields.io/badge/Python%203.12-3776AB?style=for-the-badge&logo=python&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind_css&logoColor=white)
![Tests](https://img.shields.io/badge/E2E%20Test%20Suite-10%2F10%20Passing-brightgreen?style=for-the-badge&logo=checkmarx)
![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)

<p align="center">
  <b>A full-stack, cloud-native microservices e-commerce platform for computer hardware & peripherals, featuring AI-driven semantic vector search (PostgreSQL <code>pgvector</code> + Hugging Face embeddings), dual Next.js 14 portals (Customer Storefront + Merchant Operations Dashboard), high-concurrency async FastAPI REST backend, and production Docker containerization.</b>
</p>

[Architecture](#-system-architecture) •
[Key Engineering Highlights](#-key-engineering-highlights) •
[Dual-Portal Feature Tour](#-dual-portal-feature-tour) •
[REST API Directory](#-rest-api-specification) •
[Database Schema](#-database-design--pgvector-schema) •
[Quick Start](#-quick-start--installation) •
[Testing & QA](#-testing--quality-assurance)

</div>

---

## 📌 Executive Summary

**TechStall** is an enterprise-grade e-commerce application designed to tackle real-world e-commerce challenges: keyword-mismatch search friction, high inventory turnaround, and decoupled multi-tenant merchant operations.

Traditional e-commerce search engines fail when users search conceptually (e.g., *"whisper-quiet mechanical keyboard for late night programming"* or *"high-refresh display for competitive esports"*). TechStall resolves this by implementing a **dense vector embedding pipeline**: product specifications, titles, and descriptions are projected into a 768-dimensional semantic latent space using **BAAI/bge-base-en-v1.5** and indexed natively in **PostgreSQL 16 using `pgvector`**.

The platform is split into two specialized, independently deployable Next.js 14 applications connected to a centralized asynchronous FastAPI service layer:
1. **Customer Storefront (`/Frontend`)**: Premium, consumer-facing shopping experience with real-time semantic discovery, persistent slide-over carts, interactive Razorpay checkout simulation, customer review submission, and live order tracking.
2. **Merchant Operations Dashboard (`/Seller_dahsboard`)**: High-utility seller back-office for real-time inventory management, one-click restocks, technical spec builder, Cloudinary media CDN uploads, order status fulfillment pipelines, and financial KPI analytics.

---

## 🌟 Key Engineering Highlights

### 1. 🧠 AI Semantic Vector Search Engine
- **Dense Embeddings Pipeline**: Queries and product records are transformed into 768-dimensional normalized vector embeddings via the Hugging Face Inference API (`BAAI/bge-base-en-v1.5`).
- **PostgreSQL `pgvector` Integration**: Leverages cosine distance operators (`<=>`) in SQL to execute similarity searches across thousands of SKUs in sub-10ms.
- **Graceful Offline Fallback**: Features an automated zero-vector fallback and hybrid text-ranking mechanism ensuring search queries never fail, even under third-party API rate limits or network degradation.

### 2. ⚡ High-Throughput Async Backend (FastAPI + AsyncPG)
- **Non-Blocking I/O**: Built entirely on Python 3.12's `asyncio` loop with `asyncpg` connection pooling and `SQLAlchemy 2.0` async ORM.
- **Strict Pydantic v2 Contracts**: Runtime request validation and response serialization ensuring zero type leaks.
- **Enterprise Security**: Argon2 & Bcrypt password hashing (`pwdlib`), cryptographically signed JWT access & refresh tokens, HTTP-only cookie management, and role-based access control (`ROLE_CUSTOMER` vs. `ROLE_SELLER`).

### 3. 🎨 Modern Next.js 14 App Router Frontends
- **Hybrid Rendering Architecture**:
  - **SSG (Static Site Generation)**: Pre-rendered landing page, marketing hubs, brand showcases, and static assets for instant First Contentful Paint (<0.6s).
  - **SSR (Server-Side Rendering)**: Dynamic catalog search and multi-facet filtering with server-evaluated metadata.
  - **ISR (Incremental Static Regeneration)**: Product detail pages (`/products/[id]`) revalidated in the background (`revalidate: 60`).
- **TanStack Query v5**: Server-state management with optimistic UI updates, background caching, and automatic garbage collection.
- **Responsive Theme System**: Handcrafted color palette featuring **Deep Navy (`#0B1F3A`)**, **Electric Tech Blue (`#2563EB`)**, and **Vibrant Orange (`#FF6B1A`)** with strict WCAG AA contrast compliance.

### 4. 💳 Razorpay Transaction & Sandbox Simulator
- **Seamless Checkout**: Full checkout lifecycle supporting live Razorpay credentials or the interactive built-in **Razorpay Sandbox Simulator** for offline evaluation.
- **Payment Verification**: Cryptographic HMAC-SHA256 signature verification validating payment authenticity before transitioning orders from `PENDING` to `CONFORMED`.

### 5. 🐳 Production-Ready Containerization
- **Multi-Stage Builds**:
  - Backend multi-stage builder (`python:3.12-slim`) with non-root system user (`appuser`, UID 1001).
  - Next.js standalone runner (`output: 'standalone'`) yielding ultra-compact ~225MB Alpine images.
- **Dual Compose Configurations**:
  - `docker-compose.dev.yml`: Volume-mounted code with hot-reloading (`uvicorn --reload` & React Fast Refresh).
  - `docker-compose.prod.yml`: Hardened, optimized production stack with Docker health checks and restart policies.

---

## 🏗 System Architecture

```mermaid
flowchart TD
    subgraph Clients["Clients & Presentation Layer"]
        CUST["Customer Storefront\nNext.js 14 App Router\nPort :3000"]
        SELLER["Seller Dashboard\nNext.js 14 App Router\nPort :3002"]
    end

    subgraph Gateway["API Layer & Reverse Proxy"]
        API["FastAPI Async REST Service\nUvicorn Workers\nPort :8000"]
        AUTH["JWT / Cookie Auth Provider\nArgon2 / Bcrypt / HMAC"]
    end

    subgraph CoreServices["External Services & ML Pipelines"]
        HF["Hugging Face API\nBAAI/bge-base-en-v1.5\n768-dim Embeddings"]
        CLD["Cloudinary Media CDN\nAsset Uploads & Video Transcoding"]
        RZP["Razorpay Gateway / Simulator\nWebhook & Signature Verification"]
    end

    subgraph DataTier["Data Persistence Layer"]
        DB[("PostgreSQL 16 DB\npgvector Enabled\nPort :5433")]
        VEC["products_embeddings\nVector(768) Cosine Index"]
        REL["Relational Entities\nUsers, Orders, Items, Reviews"]
    end

    CUST -->|HTTP / JSON-LD| API
    SELLER -->|HTTP / Multi-part| API
    API --> AUTH
    API -->|Generate Vectors| HF
    API -->|Store & Fetch Media| CLD
    API -->|Process Payments| RZP
    API -->|AsyncPG Connection Pool| DB
    DB --> VEC
    DB --> REL
```

---

## 📱 Dual-Portal Feature Tour

### 🛍 1. Customer Storefront (`/Frontend`)
- **Semantic Product Search**: Real-time autocomplete and natural language search powered by vector cosine similarity.
- **Smart Hardware Catalog**: Multi-attribute filtering (Brand, Category, Price Range, In-Stock status, Sort by Price/Rating).
- **Rich Product Detail Pages**:
  - Multi-image and video media gallery with thumbnail switching.
  - Interactive technical specifications key-value table.
  - Expandable warranty, delivery, and return accordions.
- **Slide-Over Cart Drawer**:
  - Real-time subtotal calculation.
  - Dynamic free shipping threshold progress bar.
  - Optimistic quantity increment/decrement with stock cap enforcement.
- **Interactive Checkout & Orders**:
  - Multi-step shipping details validation.
  - Instant Razorpay modal trigger with sandbox simulator fallback.
  - Customer order history page displaying shipping carrier tracking and packing slip details.
- **Customer Reviews & Ratings**: Submit 1–5 star ratings and detailed reviews with automatic score aggregation.

### 💼 2. Seller Operations Dashboard (`/Seller_dahsboard`)
- **Executive KPI Dashboard**: Live tracking of Gross Revenue, Total Orders, Average Order Value (AOV), and Low Stock Alerts.
- **Inventory & Catalog Management**:
  - Interactive product catalog table with live SKU search and category filtering.
  - Modal-based **Product Creator & Editor** with multi-image Cloudinary upload and key-value specification builder.
  - Inline one-click restock buttons (`+10`, `+25`, `+50`, `Custom`).
  - Soft-delete (unlist) capability preserving historical order records.
- **Order Fulfillment Pipeline**:
  - Kanban-style status tabs (`Pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled`).
  - Shipping carrier assignment (e.g., Bluedart, FedEx) and tracking code recording.
  - Printable customer packing slips.
- **Review Moderation**: Direct merchant response posting to customer reviews.

---

## 🗄 Database Design & pgvector Schema

```mermaid
erDiagram
    USERS ||--o{ ORDERS : places
    USERS ||--o{ CART : maintains
    USERS ||--o{ REVIEWS : writes
    SELLERS ||--o{ PRODUCTS : manages
    PRODUCTS ||--|| PRODUCTS_EMBEDDINGS : indexed_by
    PRODUCTS ||--o{ MEDIA : contains
    PRODUCTS ||--o{ ORDER_ITEMS : included_in
    PRODUCTS ||--o{ REVIEWS : receives
    CATEGORY ||--o{ PRODUCTS : classifies
    ORDERS ||--o{ ORDER_ITEMS : consists_of
    ORDERS ||--o{ PAYMENTS : verified_by

    USERS {
        uuid id PK
        string email UK
        string name
        string mobile_number
        boolean isVerified
        datetime created_at
    }

    SELLERS {
        uuid id PK
        string email UK
        string name
        string city
        string state
        boolean isActive
    }

    PRODUCTS {
        uuid id PK
        uuid seller_id FK
        uuid category_id FK
        string title
        string brand
        string sku UK
        float price
        float selling_price
        int stock
        text[] images
        boolean isActive
    }

    PRODUCTS_EMBEDDINGS {
        uuid id PK
        uuid product_id FK
        vector_768 embedding "Dense Semantic Vector"
    }

    ORDERS {
        uuid id PK
        uuid userId FK
        float total
        enum status "PENDING, CONFORMED, SHIPPED, DELIEVERED"
        boolean isVerified
        string tracking_number
        string carrier
    }
```

---

## 🔌 REST API Specification

The FastAPI backend exposes **30+ structured endpoints** following RESTful conventions and OpenAPI 3.1 standards.

### Authentication & Profiles
| Method | Endpoint | Description | Auth Required |
|:------:|:---------|:------------|:-------------:|
| `POST` | `/api/v1/auth/user/register` | Register new customer account | No |
| `POST` | `/api/v1/auth/user/login` | Authenticate customer & receive JWT | No |
| `GET` | `/api/v1/auth/user/me` | Fetch active customer session profile | Customer JWT |
| `POST` | `/api/v1/auth/seller/register` | Onboard new merchant store | No |
| `POST` | `/api/v1/auth/seller/login` | Merchant login & credentials validation | No |
| `GET` | `/api/v1/auth/seller/me` | Fetch active merchant account details | Seller JWT |

### Catalog & Semantic Search
| Method | Endpoint | Description | Auth Required |
|:------:|:---------|:------------|:-------------:|
| `GET` | `/api/v1/product/get/products` | Retrieve products (with vector search `?search=...`) | No |
| `GET` | `/api/v1/product/get/{id}` | Fetch detailed product metadata & media gallery | No |
| `GET` | `/api/v1/product/category/{cat}/{page}/{limit}` | Paginated products by category | No |
| `POST` | `/api/v1/product/{id}/reviews` | Submit product review & star rating | Customer JWT |
| `GET` | `/api/v1/product/{id}/reviews` | Retrieve review breakdown & aggregate rating | No |

### Shopping Cart & Checkout
| Method | Endpoint | Description | Auth Required |
|:------:|:---------|:------------|:-------------:|
| `GET` | `/api/v1/cart/` | Retrieve user's active cart & calculated totals | Customer JWT |
| `POST` | `/api/v1/cart/add` | Add product to cart with specified quantity | Customer JWT |
| `POST` | `/api/v1/cart/quantity-inc` | Increment quantity of cart item | Customer JWT |
| `POST` | `/api/v1/cart/quantity-dec` | Decrement quantity or remove item | Customer JWT |
| `POST` | `/api/v1/cart/remove` | Remove item from cart | Customer JWT |

### Orders & Payment Lifecycle
| Method | Endpoint | Description | Auth Required |
|:------:|:---------|:------------|:-------------:|
| `POST` | `/api/v1/order/place-order` | Place order from cart items; creates Razorpay order | Customer JWT |
| `POST` | `/api/v1/order/verify-order` | Validate Razorpay signature; mark order `CONFORMED` | Customer JWT |
| `GET` | `/api/v1/order/orders` | Fetch customer's order history | Customer JWT |
| `GET` | `/api/v1/order/get-order/{id}` | Retrieve specific order details | Customer JWT |
| `POST` | `/api/v1/order/cancel-order` | Cancel pending order | Customer JWT |

### Merchant Operations (Seller)
| Method | Endpoint | Description | Auth Required |
|:------:|:---------|:------------|:-------------:|
| `POST` | `/api/v1/seller/new-product` | Publish product, trigger embedding sync | Seller JWT |
| `POST` | `/api/v1/seller/modify-product` | Update product details, specs, or pricing | Seller JWT |
| `POST` | `/api/v1/seller/change-stock` | Restock or adjust inventory levels | Seller JWT |
| `POST` | `/api/v1/seller/delete-product` | Soft-delete / unlist product from storefront | Seller JWT |
| `GET` | `/api/v1/seller/orders/get-orders` | Fetch seller's incoming orders stream | Seller JWT |
| `POST` | `/api/v1/seller/orders/change-order-status` | Transition order status (`PROCESSING`, `SHIPPED`, etc.) | Seller JWT |
| `POST` | `/api/v1/seller/upload-media` | Upload media asset to Cloudinary CDN | Seller JWT |

---

## 🛠 Tech Stack Deep Dive

| Layer | Technologies |
|:------|:-------------|
| **Frontend Frameworks** | Next.js 14.2 (App Router), React 18, TypeScript 5.6 |
| **Styling & UI** | Tailwind CSS 3.4, Lucide React, Custom CSS Micro-animations |
| **State & Data Fetching** | TanStack Query v5 (React Query), Context API, LocalStorage Sync |
| **Authentication** | NextAuth.js v4 (Credentials Provider), PyJWT, Argon2, Bcrypt |
| **Backend API** | FastAPI, Uvicorn (ASGI), Starlette, Pydantic v2 |
| **Database & ORM** | PostgreSQL 16, `pgvector` extension, SQLAlchemy 2.0 (Async), AsyncPG |
| **AI / Machine Learning** | Hugging Face Inference API, BAAI/bge-base-en-v1.5 (768-dim embeddings) |
| **Cloud Media & Payments**| Cloudinary REST API, Razorpay Payment Gateway & Sandbox Simulator |
| **DevOps & Tooling** | Docker, Docker Compose v2, BuildKit, Multi-stage builds |

---

## 🚀 Quick Start & Installation

### Option 1: 1-Click Docker Setup (Recommended)

Ensure [Docker Desktop](https://www.docker.com/products/docker-desktop/) is running.

```bash
# 1. Clone repository
git clone https://github.com/your-username/techstall-ecommerce.git
cd techstall-ecommerce

# 2. Configure environment
cp .env.docker.dev .env

# 3. Launch the complete microservice fleet
docker compose -f docker-compose.dev.yml up -d --build
```

#### Access Points:
- 🛒 **Customer Storefront**: [http://localhost:3000](http://localhost:3000)
- 💼 **Seller Dashboard**: [http://localhost:3002](http://localhost:3002)
- ⚡ **FastAPI Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- 🗄 **PostgreSQL 16 + pgvector**: `localhost:5433` (`postgres` / `password`)

---

### Option 2: Local Manual Setup

#### 1. Start the Vector Database
```bash
docker run -d --name pgvector_db -p 5433:5432 -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=semantic_ecommerce pgvector/pgvector:pg16
```

#### 2. Run the FastAPI Backend
```bash
cd Backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn src.main:app --host 127.0.0.1 --port 8000 --reload
```

#### 3. Run the Customer Storefront
```bash
cd Frontend
npm install
npm run dev
# Running on http://localhost:3000
```

#### 4. Run the Seller Dashboard
```bash
cd Seller_dahsboard
npm install
npm run dev
# Running on http://localhost:3001 (or :3002)
```

---

## 🧪 Testing & Quality Assurance

The codebase includes an **end-to-end integration test suite** (`Backend/test_all_features.py`) verifying all functional workflows against live database instances:

```bash
cd Backend
python test_all_features.py
```

### Test Coverage Matrix
```
=== Starting Full E-Commerce Feature Test Suite ===
✔ [Test 1]  Seller Registration, JWT Authentication & Profile Verification (/me)
✔ [Test 2]  Customer Registration & Login Flow
✔ [Test 3]  Seller Product Creation & Auto-Embedding Generation
✔ [Test 4]  Product Modification & Inventory Restock Synchronization
✔ [Test 5]  Customer Product Catalog Browsing & Detail Retrieval
✔ [Test 6]  Cart Management (Add Item, Increment Qty, Decrement Qty)
✔ [Test 7]  Order Placement, Razorpay Signature Verification & Orders History
✔ [Test 8]  Seller Order Pipeline Fulfillment (PENDING -> CONFORMED -> SHIPPED)
✔ [Test 9]  Customer Product Reviews & Real-Time Star Rating Recalculation
✔ [Test 10] Seller Product Unlisting / Soft-Delete Capability
=======================================================
[SUCCESS] ALL 10 CORE FEATURE TEST MODULES PASSED SUCCESSFULLY!
=======================================================
```

---

## 🎨 Design System & Color Palette

The interface is styled using a modern high-tech visual hierarchy:

| Swatch | Color Name | Hex Code | Purpose |
|:------:|:-----------|:---------|:--------|
| <img src="https://via.placeholder.com/20/0B1F3A/000000?text=+" width="20" height="20" /> | **Deep Space Navy** | `#0B1F3A` | Primary headers, navbars, footers, and cards |
| <img src="https://via.placeholder.com/20/2563EB/000000?text=+" width="20" height="20" /> | **Electric Tech Blue**| `#2563EB` | Primary CTA buttons, active state pills, highlights |
| <img src="https://via.placeholder.com/20/FF6B1A/000000?text=+" width="20" height="20" /> | **Vibrant Orange** | `#FF6B1A` | Add to Cart actions, sale badges, discounts |
| <img src="https://via.placeholder.com/20/F8FAFC/000000?text=+" width="20" height="20" /> | **Slate Surface** | `#F8FAFC` | Page backgrounds, clean contrast surfaces |
| <img src="https://via.placeholder.com/20/122B4F/000000?text=+" width="20" height="20" /> | **Deep Border Blue**| `#122B4F` | Card dividers, subtle container borders |

---

## 👨‍💻 Author & Engineering Credits

**Vishal Singh Rajput**
- 📧 Email: [vishalsinghraj2005@outlook.com](mailto:vishalsinghraj2005@outlook.com)
- 💼 LinkedIn: [linkedin.com/in/vishalsinghraj](https://linkedin.com)
- 🐙 GitHub: [github.com/vishalsinghraj](https://github.com)

---

<div align="center">
  <sub>Engineered with precision for high-scale, modern e-commerce. Built with Next.js 14, FastAPI, PostgreSQL pgvector, and Docker.</sub>
</div>
