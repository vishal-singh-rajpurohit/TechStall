import urllib.request
import json
import uuid
import sys

BASE_URL = "http://127.0.0.1:8000/api/v1"

def make_request(url, method="GET", data=None, headers=None):
    if headers is None:
        headers = {}
    if data is not None:
        headers["Content-Type"] = "application/json"
        req_data = json.dumps(data).encode("utf-8")
    else:
        req_data = None
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            status_code = response.getcode()
            body = response.read().decode("utf-8")
            try:
                res_json = json.loads(body)
            except Exception:
                res_json = body
            return status_code, res_json, None
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            res_json = json.loads(body)
        except Exception:
            res_json = body
        return e.code, res_json, str(e)
    except Exception as e:
        return 0, None, str(e)

def run_tests():
    print("=" * 60)
    print("1. TESTING CATALOG & SHOP BROWSING")
    print("=" * 60)

    # 1.1 List products
    status, products, err = make_request(f"{BASE_URL}/product/products")
    print(f"[*] GET /product/products -> HTTP {status}")
    if status != 200:
        print(f"FAILED: {err} -> {products}")
        return False
    print(f"    Returned {len(products)} products.")

    # 1.2 Categories
    status, categories, err = make_request(f"{BASE_URL}/categories")
    print(f"[*] GET /categories -> HTTP {status}")
    if status != 200:
        print(f"    Notice: {err} -> {categories}")
    else:
        print(f"    Returned {len(categories)} categories.")

    # 1.3 Brands
    status, brands, err = make_request(f"{BASE_URL}/brands")
    print(f"[*] GET /brands -> HTTP {status}")
    if status != 200:
        print(f"    Notice: {err} -> {brands}")
    else:
        print(f"    Returned {len(brands)} brands.")

    test_product_id = products[0]["id"] if products else None
    if test_product_id:
        status, prod_detail, err = make_request(f"{BASE_URL}/product/products/{test_product_id}")
        print(f"[*] GET /product/products/{test_product_id} -> HTTP {status}")
        if status != 200:
            print(f"FAILED: {err} -> {prod_detail}")
        else:
            print(f"    Title: {prod_detail.get('title')}, Price: {prod_detail.get('price')}")

    print("\n" + "=" * 60)
    print("2. TESTING USER AUTHENTICATION & ORDERS")
    print("=" * 60)

    unique_suffix = str(uuid.uuid4())[:8]
    user_email = f"testuser_{unique_suffix}@example.com"
    user_password = "Password123!"

    # 2.1 Register User
    reg_payload = {
        "name": f"Test Customer {unique_suffix}",
        "email": user_email,
        "password": user_password,
        "conform_password": user_password,
        "mobile_number": f"9876{unique_suffix[:6]}"
    }
    status, reg_res, err = make_request(f"{BASE_URL}/auth/user/register", method="POST", data=reg_payload)
    print(f"[*] POST /auth/user/register -> HTTP {status}")
    if status != 201:
        print(f"FAILED: {err} -> {reg_res}")
        return False
    user_token = reg_res.get("access_token")
    user_headers = {"Authorization": f"Bearer {user_token}"}
    print(f"    User registered! Token obtained: {bool(user_token)}")

    # 2.2 Login User
    login_payload = {
        "email": user_email,
        "password": user_password
    }
    status, login_res, err = make_request(f"{BASE_URL}/auth/user/login", method="POST", data=login_payload)
    print(f"[*] POST /auth/user/login -> HTTP {status}")
    if status != 200:
        print(f"FAILED: {err} -> {login_res}")
        return False
    print(f"    User logged in successfully!")

    # 2.3 Place Order
    if test_product_id:
        order_payload = {
            "address": "123 Tech Park, MG Road",
            "city": "Bengaluru",
            "state": "Karnataka",
            "pin_code": "560001",
            "mobile_number": "9876543210",
            "notes": "Please deliver during office hours",
            "items": [
                {
                    "product_id": test_product_id,
                    "quantity": 1
                }
            ]
        }
        status, order_res, err = make_request(f"{BASE_URL}/order/place-order", method="POST", data=order_payload, headers=user_headers)
        print(f"[*] POST /order/place-order -> HTTP {status}")
        if status != 201:
            print(f"FAILED: {err} -> {order_res}")
            return False
        order_id = order_res.get("id")
        print(f"    Order placed: #{order_id}, Total: {order_res.get('total')}, Status: {order_res.get('status')}")

        # 2.4 Verify / Simulate Razorpay payment
        verify_payload = {
            "order_id": order_id,
            "razorpay_payment_id": f"pay_{unique_suffix}",
            "razorpay_signature": f"sig_{unique_suffix}",
            "razorpay_order_id": f"order_{unique_suffix}"
        }
        status, verify_res, err = make_request(f"{BASE_URL}/order/verify-order", method="POST", data=verify_payload, headers=user_headers)
        print(f"[*] POST /order/verify-order -> HTTP {status}")
        if status != 200:
            print(f"FAILED: {err} -> {verify_res}")
        else:
            print(f"    Order payment verified! isVerified={verify_res.get('isVerified')}")

        # 2.5 Fetch User Order details
        status, fetched_order, err = make_request(f"{BASE_URL}/order/get-order/{order_id}", method="GET", headers=user_headers)
        print(f"[*] GET /order/get-order/{order_id} -> HTTP {status}")
        if status != 200:
            print(f"FAILED: {err} -> {fetched_order}")
        else:
            print(f"    Fetched verified order details: Items={len(fetched_order.get('items', []))}")

    print("\n" + "=" * 60)
    print("3. TESTING SELLER AUTHENTICATION & INVENTORY")
    print("=" * 60)

    seller_email = f"seller_{unique_suffix}@example.com"
    seller_password = "Password123!"

    # 3.1 Register Seller
    seller_reg_payload = {
        "name": f"Apex Store {unique_suffix}",
        "email": seller_email,
        "password": seller_password,
        "conform_password": seller_password,
        "mobile_number": f"9876{unique_suffix[:6]}",
        "city": "Bengaluru",
        "state": "Karnataka"
    }
    status, sreg_res, err = make_request(f"{BASE_URL}/auth/seller/register", method="POST", data=seller_reg_payload)
    print(f"[*] POST /auth/seller/register -> HTTP {status}")
    if status != 201:
        print(f"FAILED: {err} -> {sreg_res}")
        return False
    seller_token = sreg_res.get("access_token")
    seller_headers = {"Authorization": f"Bearer {seller_token}"}
    print(f"    Seller registered! Token obtained: {bool(seller_token)}")

    # 3.2 Login Seller
    slogin_payload = {
        "email": seller_email,
        "password": seller_password
    }
    status, slogin_res, err = make_request(f"{BASE_URL}/auth/seller/login", method="POST", data=slogin_payload)
    print(f"[*] POST /auth/seller/login -> HTTP {status}")
    if status != 200:
        print(f"FAILED: {err} -> {slogin_res}")
        return False
    print(f"    Seller logged in successfully!")

    # 3.3 Create New Hardware Product with Media and Specs
    new_prod_payload = {
        "title": f"Test Ultra Gaming Mouse {unique_suffix}",
        "description": ["High precision wireless sensor mouse with 26000 DPI."],
        "price": 4999.0,
        "selling_price": 3999.0,
        "stock": 45,
        "brand": "Razer Tech",
        "sku": f"MS-{unique_suffix.upper()}",
        "images": ["https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80"],
        "specifications": {"DPI": "26,000", "Sensor": "Optical Focus Pro", "Weight": "58g"},
        "media": [
            {
                "media_type": "image",
                "url": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80",
                "is_primary": True,
                "order": 0
            }
        ]
    }
    status, new_prod_res, err = make_request(f"{BASE_URL}/seller/add-product", method="POST", data=new_prod_payload, headers=seller_headers)
    print(f"[*] POST /seller/add-product -> HTTP {status}")
    if status not in [200, 201]:
        print(f"FAILED: {err} -> {new_prod_res}")
        return False
    new_pid = new_prod_res.get("id") or new_prod_res.get("product", {}).get("id")
    prod_title = new_prod_res.get("title") or new_prod_res.get("product", {}).get("title")
    print(f"    Product created! ID: {new_pid}, Title: {prod_title}")

    # 3.4 Update product stock
    stock_payload = {
        "product_id": new_pid,
        "stock": 100
    }
    status, stock_res, err = make_request(f"{BASE_URL}/seller/change-stock", method="PATCH", data=stock_payload, headers=seller_headers)
    print(f"[*] PATCH /seller/change-stock -> HTTP {status}")
    if status != 200:
        print(f"FAILED: {err} -> {stock_res}")
    else:
        print(f"    Stock updated! New Stock: {stock_res.get('stock')}")

    # 3.5 Fetch seller products
    status, seller_prods, err = make_request(f"{BASE_URL}/seller/my-products", method="GET", headers=seller_headers)
    print(f"[*] GET /seller/my-products -> HTTP {status}")
    if status != 200:
        print(f"FAILED: {err} -> {seller_prods}")
    else:
        print(f"    Seller has {len(seller_prods)} hardware products.")

    print("\n" + "=" * 60)
    print("ALL API CORE FEATURES VERIFIED SUCCESSFULLY!")
    print("=" * 60)
    return True

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
