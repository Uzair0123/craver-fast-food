import os
import json
from datetime import datetime
import redis
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Database Configuration
REDIS_HOST = os.environ.get("REDIS_HOST", "order-db")
REDIS_PORT = int(os.environ.get("REDIS_PORT", 6379))
db = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)

# AI Engine Configuration (Internal Docker DNS)
AI_HOST = os.environ.get("AI_HOST", "ai-engine")
AI_PORT = int(os.environ.get("AI_PORT", 11434))
AI_MODEL = os.environ.get("AI_MODEL", "qwen2.5:0.5b")

CRAVER_SYSTEM_PROMPT = """You are Craver AI, the friendly food recommendation assistant for Craver Fast Food.
Our Official Menu & Prices:
- Craver Double Smash Burger ($5.99): Double beef patties, melted cheddar, pickles, secret sauce.
- Crispy Spicy Chicken Sandwich ($6.49): Golden fried chicken breast, cayenne mayo, toasted brioche.
- Artisanal Pepperoni Pizza ($8.99): Stone-baked pizza with crispy mozzarella and pepperoni.
- Golden French Fries ($2.99): Classic sea-salted crispy potato fries.
- Cheesy Loaded Bacon Fries ($4.49): Fries smothered in melted cheddar and smoky bacon bits.
- Chocolate Hazelnut Shake ($3.99): Hand-spun creamy thick chocolate shake.
- Strawberry Sundae ($2.99): Vanilla soft-serve with fresh strawberry puree.

Rules:
1. Recommend 1 or 2 matching items based on what the user asks.
2. Keep your answer brief, mouthwatering, and under 3 sentences.
3. Always mention the exact menu item name and price."""

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy", "service": "craver-order-api", "database": "redis", "ai": "enabled"})

@app.route("/api/order", methods=["POST"])
def place_order():
    try:
        order_data = request.get_json()
        if not order_data:
            return jsonify({"error": "No order data provided"}), 400

        order_id = order_data.get("orderId", f"#CRV-{int(datetime.utcnow().timestamp())}")
        order_data["savedAt"] = datetime.utcnow().isoformat()

        db.set(f"order:{order_id}", json.dumps(order_data))
        db.lpush("orders:all", order_id)

        return jsonify({"status": "success", "orderId": order_id, "message": "Order stored in database!"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/orders", methods=["GET"])
def get_orders():
    try:
        order_ids = db.lrange("orders:all", 0, 50)
        orders = []
        for oid in order_ids:
            raw = db.get(f"order:{oid}")
            if raw:
                orders.append(json.loads(raw))
        return jsonify({"total": len(orders), "orders": orders}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/ai/recommend", methods=["POST"])
def ai_recommend():
    """Production endpoint: Proxies requests to internal containerized AI engine"""
    try:
        data = request.get_json() or {}
        user_prompt = data.get("prompt", "What is your top recommendation?")

        # Prepare the standardized OpenAI payload
        payload = {
            "model": AI_MODEL,
            "messages": [
                {"role": "system", "content": CRAVER_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt}
            ],
            "stream": False
        }

        # Internal container-to-container HTTP call
        ai_url = f"http://{AI_HOST}:{AI_PORT}/v1/chat/completions"
        resp = requests.post(ai_url, json=payload, timeout=25)

        if resp.status_code == 200:
            result = resp.json()
            answer = result["choices"][0]["message"]["content"]
            return jsonify({"status": "success", "recommendation": answer}), 200
        else:
            return jsonify({
                "status": "fallback",
                "recommendation": "Craver Double Smash Burger ($5.99) with Golden French Fries ($2.99) is our best-selling combo today!"
            }), 200
    except Exception as e:
        print(f"⚠️ AI Engine connection error: {e}")
        return jsonify({
            "status": "fallback",
            "recommendation": "Try our Crispy Spicy Chicken Sandwich ($6.49) — our kitchen's hot favorite right now!"
        }), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
