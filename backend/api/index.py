from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/api/search', methods=['POST'])
def search():
    # Your search logic here
    data = request.get_json()
    return jsonify({"status": "success", "results": []})

if __name__ == '__main__':
    app.run(debug=True)

# Vercel needs the 'app' variable exposed at the module level
