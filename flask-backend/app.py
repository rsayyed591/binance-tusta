from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  

@app.route('/trendline', methods=['POST'])
def receive_trendline():
    try:
        data = request.json
        start = data.get("start")
        end = data.get("end")
        
        if not start or not end:
            return jsonify({"error": "Invalid data"}), 400
        
        print(f"Trendline Coordinates: Start - {start}, End - {end}")
        
        # You can add logic here to save to a database if needed
        return jsonify({"message": "Coordinates received successfully"}), 200
    
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
