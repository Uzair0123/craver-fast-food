import os
import json
from datetime import datetime
import redis
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
# Enable CORS so browser on port 8085 can send requests to port 5000
CORS(app)

# Connect to Redis using Docker Compose DNS name 'order-db'
REDIS_HOST = os.environ.get("REDIS_HOST", "order-db")
REDIS_PORT = int(os.environ.get("REDIS_PORT", 6379))

db = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy", "service": "craver-order-api", "database": "redis"})

@app.route("/api/order", methods=["POST"])
def place_order():
    try:
        order_data = request.get_json()
        if not order_data:
            return jsonify({"error": "No order data provided"}), 400

        order_id = order_data.get("orderId", f"#CRV-{int(datetime.utcnow().timestamp())}")
        order_data["savedAt"] = datetime.utcnow().isoformat()

        # Save individual order in Redis key: order:<id>
        db.set(f"order:{order_id}", json.dumps(order_data))

        # Add order ID to the master list of all orders
        db.lpush("orders:all", order_id)

        print(f"✅ Successfully saved {order_id} into Redis volume!")
        return jsonify({"status": "success", "orderId": order_id, "message": "Order stored in database!"}), 201
    except Exception as e:
        print(f"❌ Error saving order: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/orders", methods=["GET"])
def get_orders():
    """Retrieve all customer orders from Redis"""
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

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
