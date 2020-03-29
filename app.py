from flask import Flask, jsonify, request, render_template, abort, redirect, send_from_directory
import json
from flask_cors import CORS
source_folder = "./"

app = Flask(
    __name__, static_url_path="", static_folder='./src/',
    template_folder=source_folder
)
CORS(app)

@app.route('/getmodel/<string:model_file_name>')
def get_model(model_file_name):
    # The model json requested:
    if model_file_name.endswith('.json'):
        with open('models/model.json', 'r') as f:
            model = json.load(f)
        return jsonify(model)
    # Getting the model bin file:
    elif model_file_name.endswith('.bin'):
        try:
            return send_from_directory('models/', model_file_name,
                                       as_attachment=True)
        except:
            abort(404, 'Model file not available')


@app.route('/')
def index():
    return render_template('index.html'), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)
