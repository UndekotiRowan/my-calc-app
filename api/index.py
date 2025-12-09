from flask import Flask, jsonify, request

app = Flask(__name__)

# This handles the calculation
@app.route("/api/calculate", methods=['POST'])
def calculate():
    try:
        # 1. Get the JSON data sent from the frontend
        data = request.json
        
        # 2. Extract values (Default to 0 if missing)
        principal = float(data.get('principal', 0))
        rate = float(data.get('rate', 0))
        time = float(data.get('time', 0))
        
        # 3. Perform the Calculation (Compound Interest Formula)
        # Formula: A = P(1 + r/100)^t
        amount = principal * ((1 + rate/100) ** time)
        interest_earned = amount - principal
        
        # 4. Return the result as JSON
        return jsonify({
            "status": "success",
            "principal": principal,
            "total_amount": round(amount, 2),
            "interest_earned": round(interest_earned, 2),
            "message": "Computed successfully via Python"
        })

    except Exception as e:
        # If something crashes (e.g., user sends text instead of numbers)
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 400

# Required for Vercel to find the app
if __name__ == "__main__":
    app.run()