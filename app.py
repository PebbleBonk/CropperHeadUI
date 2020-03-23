from flask import Flask, jsonify, request, render_template, abort, redirect
import json

source_folder = "./"  #"web" # text2mindmap

app = Flask(
    __name__, static_url_path="", static_folder='./src/',
    template_folder=source_folder
)

@app.route('/model')
def get_model():
    with open('models/model.json', 'r') as f:
        model = json.load(f)
    return jsonify(model)


@app.route('/')
def index():
    return render_template('index.html'), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)
