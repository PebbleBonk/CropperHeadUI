from flask import Flask, jsonify, request, render_template, abort, redirect, send_from_directory
import os
import json
from flask_cors import CORS
source_folder = "./"

models_folder = os.path.join(
    os.path.dirname(os.path.realpath(__file__)), 'models'
)

app = Flask(
    __name__, static_url_path="", static_folder='./src/',
    template_folder=source_folder
)
CORS(app)

@app.route('/getmodel/<string:model_file_name>')
def get_model(model_file_name):
    # NOTE: Possible risk for directory traversal!
    if '../' in model_file_name:
        abort(403, 'Forbidden model name')

    # The model json requested:
    if model_file_name.endswith('.json'):
        model_file = os.path.join(models_folder, model_file_name)

        if not os.path.isfile(model_file):
            abort(404, 'model not found: '+model_file_name)
        with open(model_file, 'r') as f:
            model = json.load(f)

        return jsonify(model)
    # Getting the model bin file:
    elif model_file_name.endswith('.bin'):
        try:
            return send_from_directory(models_folder, model_file_name,
                                       as_attachment=True)
        except:
            abort(404, 'Model file not available')


@app.route('/')
def index():
    return render_template('index.html'), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)
