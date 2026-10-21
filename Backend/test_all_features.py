import asyncio
import httpx
import uuid
import sys

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

BASE_URL = "http://127.0.0.1:8000/api/v1"

async def run_tests():
    print("=== Starting Full E-Commerce Feature Test Suite ===")
    async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
        # 1. Test Seller Auth
        print("\n--- Test 1: Seller Registration & Login ---")
        seller_email = f"seller_{uuid.uuid4().hex[:6]}@techstall.com"
        seller_password = "Password123!"
        reg_payload = {
            "name": "Apex Hardware Labs",
            "email": seller_email,
            "password": seller_password,
            "conform_password": seller_password,
            "mobile_number": "9876543210",
            "city": "Bengaluru",
            "state": "Karnataka",
        }
        res = await client.post("/auth/seller/register", json=reg_payload)
        assert res.status_code == 201, f"Seller register failed: {res.text}"
        seller_data = res.json()
        print(f" [PASS] Seller registered: {seller_data['seller']['name']} (ID: {seller_data['seller']['id']})")

        # Seller Login
        login_payload = {
            "email": seller_email,
            "password": seller_password,
        }
        res = await client.post("/auth/seller/login", json=login_payload)
        assert res.status_code == 200, f"Seller login failed: {res.text}"
        seller_token = res.json()["access_token"]
        seller_headers = {"Authorization": f"Bearer {seller_token}"}
        print(" [PASS] Seller logged in successfully, JWT received.")

        # Seller Profile (/me)
        res = await client.get("/auth/seller/me", headers=seller_headers)
        assert res.status_code == 200, f"Seller /me failed: {res.text}"
        print(f" [PASS] Seller profile verified: {res.json()['name']}, active={res.json().get('isActive')}")

        # 2. Test Customer Auth
        print("\n--- Test 2: Customer Registration & Login ---")
        user_email = f"cust_{uuid.uuid4().hex[:6]}@example.com"
        user_password = "Password123!"
        user_mobile = f"9{uuid.uuid4().int % 1000000000:09d}"
        user_reg_payload = {
            "first_name": "Rohan",
            "last_name": "Sharma",
            "email": user_email,
            "password": user_password,
            "mobile_number": user_mobile,
        }
        res = await client.post("/auth/user/register", json=user_reg_payload)
        assert res.status_code == 201, f"User register failed: {res.text}"
        user_token = res.json()["access_token"]
        user_headers = {"Authorization": f"Bearer {user_token}"}
        print(f" [PASS] Customer registered: {res.json()['user']['name']}")

        # Customer Login
        res = await client.post("/auth/user/login", json={"email": user_email, "password": user_password})
        assert res.status_code == 200, f"User login failed: {res.text}"
        user_token = res.json()["access_token"]
        user_headers = {"Authorization": f"Bearer {user_token}"}
        print(" [PASS] Customer logged in successfully.")

        # 3. Test Seller Product Creation
        print("\n--- Test 3: Seller Product Creation ---")
        prod_sku = f"GPU-{uuid.uuid4().hex[:6].upper()}"
        new_prod_payload = {
            "title": "NVIDIA RTX 4080 Super Ultra Gaming GPU",
            "brand": "NVIDIA",
            "sku": prod_sku,
            "price": 95000.0,
            "selling_price": 89999.0,
            "stock": 15,
            "description": [
                "16GB GDDR6X High-speed VRAM",
                "Ada Lovelace Architecture with DLSS 3.5",
                "Triple Fan IceStorm Cooling with Metal Backplate",
            ],
            "specifications": {
                "Memory": "16GB GDDR6X",
                "Memory Bus": "256-bit",
                "Boost Clock": "2550 MHz",
                "Power Connector": "1x 16-pin (12VHPWR)",
            },
            "images": [
                "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=800&q=80",
            ],
            "media": [
                {
                    "media_type": "image",
                    "url": "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80",
                    "is_primary": True,
                    "order": 0,
                }
            ],
        }
        res = await client.post("/seller/new-product", json=new_prod_payload, headers=seller_headers)
        assert res.status_code == 201, f"Product creation failed: {res.text}"
        created_product = res.json()["product"]
        product_id = created_product["id"]
        print(f" [PASS] Product created successfully! ID: {product_id}, SKU: {prod_sku}")

        # 4. Test Seller Product Modification
        print("\n--- Test 4: Seller Product Modification & Restock ---")
        mod_payload = {
            "product_id": product_id,
            "title": "NVIDIA RTX 4080 Super Ultra Gaming OC Edition",
            "selling_price": 87999.0,
        }
        res = await client.post("/seller/modify-product", json=mod_payload, headers=seller_headers)
        assert res.status_code == 200, f"Modify product failed: {res.text}"
        print(f" [PASS] Product updated: new title: {res.json()['product']['title']}")

        # Stock Change
        stock_payload = {
            "product_id": product_id,
            "stock": 25,
        }
        res = await client.post("/seller/change-stock", json=stock_payload, headers=seller_headers)
        assert res.status_code == 200, f"Stock change failed: {res.text}"
        print(f" [PASS] Stock updated to: {res.json()['product']['stock']}")

        # 5. Test Customer Product Browsing
        print("\n--- Test 5: Customer Product Browsing & Detail Retrieval ---")
        res = await client.get("/product/get/products")
        assert res.status_code == 200, f"Browse products failed: {res.text}"
        all_prods = res.json()
        assert len(all_prods) > 0, "No products returned from catalog"
        print(f" [PASS] Catalog browsing: {len(all_prods)} products found in store.")

        # Single product detail
        res = await client.get(f"/product/get/{product_id}")
        assert res.status_code == 200, f"Single product fetch failed: {res.text}"
        fetched_p = res.json()
        assert fetched_p["id"] == product_id
        print(f" [PASS] Single product detail fetched: '{fetched_p['title']}', Price: Rs. {fetched_p['selling_price']}")

        # 6. Test Cart Features
        print("\n--- Test 6: Cart Add, Quantity Update, Dec ---")
        cart_add_payload = {
            "product_id": product_id,
            "quantity": 2,
        }
        res = await client.post("/cart/add", json=cart_add_payload, headers=user_headers)
        assert res.status_code == 200, f"Cart add failed: {res.text}"
        cart_data = res.json()
        print(f" [PASS] Added to cart. Items count: {len(cart_data['items'])}, Total: Rs. {cart_data['total_amount']}")

        # Quantity Inc
        res = await client.post("/cart/quantity-inc", json={"product_id": product_id, "amount": 1}, headers=user_headers)
        assert res.status_code == 200, f"Quantity inc failed: {res.text}"
        item_qty = next(i["quantity"] for i in res.json()["items"] if i["product"]["id"] == product_id)
        assert item_qty == 3, f"Expected quantity 3, got {item_qty}"
        print(f" [PASS] Quantity incremented to {item_qty}.")

        # Quantity Dec
        res = await client.post("/cart/quantity-dec", json={"product_id": product_id, "amount": 1}, headers=user_headers)
        assert res.status_code == 200, f"Quantity dec failed: {res.text}"
        item_qty = next(i["quantity"] for i in res.json()["items"] if i["product"]["id"] == product_id)
        assert item_qty == 2, f"Expected quantity 2, got {item_qty}"
        print(f" [PASS] Quantity decremented back to {item_qty}.")

        # 7. Test Customer Order Placement
        print("\n--- Test 7: Place Order & Razorpay Payment Verification ---")
        order_payload = {
            "address": "Flat 404, Tech Park Residency, Whitefield",
            "city": "Bengaluru",
            "state": "Karnataka",
            "pin_code": "560066",
            "mobile_number": user_mobile,
            "notes": "Please deliver during business hours.",
        }
        res = await client.post("/order/place-order", json=order_payload, headers=user_headers)
        assert res.status_code == 201, f"Order placement failed: {res.text}"
        order_data = res.json()
        order_id = order_data["id"]
        print(f" [PASS] Order placed successfully! ID: {order_id}, Status: {order_data['status']}, Total: Rs. {order_data['total']}")

        # Verify Razorpay Order Verification
        rzp_payment_id = f"pay_{uuid.uuid4().hex[:12]}"
        rzp_order_id = order_data.get("payment", {}).get("razorpay_order_id") or f"order_{uuid.uuid4().hex[:12]}"
        verify_payload = {
            "order_id": order_id,
            "razorpay_payment_id": rzp_payment_id,
            "razorpay_signature": "mock_valid_signature_hash_12345",
            "razorpay_order_id": rzp_order_id,
        }
        res = await client.post("/order/verify-order", json=verify_payload, headers=user_headers)
        assert res.status_code == 200, f"Order verify failed: {res.text}"
        verified_order = res.json()
        assert verified_order["isVerified"] is True
        print(f" [PASS] Order payment verified! isVerified={verified_order['isVerified']}")

        # Customer Order History
        res = await client.get("/order/orders", headers=user_headers)
        assert res.status_code == 200, f"Get customer orders failed: {res.text}"
        cust_orders = res.json()
        assert any(o["id"] == order_id for o in cust_orders)
        print(f" [PASS] Customer order history retrieved: {len(cust_orders)} order(s) listed.")

        # 8. Test Seller Order Management
        print("\n--- Test 8: Seller Order Management ---")
        res = await client.get("/seller/orders/get-orders", headers=seller_headers)
        assert res.status_code == 200, f"Seller get orders failed: {res.text}"
        seller_orders = res.json()
        print(f" [PASS] Seller orders feed: {len(seller_orders)} order(s) visible to merchant.")

        # Seller change order status to PROCESSING
        status_payload = {
            "order_id": order_id,
            "status": "PROCESSING",
        }
        res = await client.post("/seller/orders/change-order-status", json=status_payload, headers=seller_headers)
        assert res.status_code == 200, f"Change status to PROCESSING failed: {res.text}"
        print(f" [PASS] Order status updated to: {res.json()['status']}")

        # Seller change order status to SHIPPED
        status_payload = {
            "order_id": order_id,
            "status": "SHIPPED",
            "shipping_carrier": "Bluedart Express",
            "tracking_number": "BLU-889922001",
        }
        res = await client.post("/seller/orders/change-order-status", json=status_payload, headers=seller_headers)
        assert res.status_code == 200, f"Change status to SHIPPED failed: {res.text}"
        print(f" [PASS] Order status updated to: {res.json()['status']}")

        # 9. Test Product Review & Rating
        print("\n--- Test 9: Product Reviews & Ratings ---")
        review_payload = {
            "rating": 5,
            "comment": "Unbelievable graphics power! Runs Cyberpunk 2077 at 4K 120FPS flawlessly.",
            "title": "Best GPU Ever Bought!",
        }
        res = await client.post(f"/product/{product_id}/reviews", json=review_payload, headers=user_headers)
        assert res.status_code == 201, f"Review creation failed: {res.text}"
        review_data = res.json()
        print(f" [PASS] Review submitted: {review_data['rating']} stars, '{review_data['title']}'")

        # Fetch Product Reviews Breakdown
        res = await client.get(f"/product/{product_id}/reviews")
        assert res.status_code == 200, f"Get reviews failed: {res.text}"
        reviews_summary = res.json()
        print(f" [PASS] Product reviews breakdown: average={reviews_summary['average_rating']}, total={reviews_summary['total_reviews']}")

        # 10. Test Seller Soft-Delete / Unlist Product
        print("\n--- Test 10: Seller Soft-Delete / Unlist Product ---")
        res = await client.post("/seller/delete-product", json={"product_id": product_id}, headers=seller_headers)
        assert res.status_code == 200, f"Delete product failed: {res.text}"
        print(f" [PASS] Product soft-deleted/unlisted: {res.json()['message']}")

        print("\n=======================================================")
        print("[SUCCESS] ALL 10 CORE FEATURE TEST MODULES PASSED SUCCESSFULLY!")
        print("=======================================================")

if __name__ == "__main__":
    asyncio.run(run_tests())
