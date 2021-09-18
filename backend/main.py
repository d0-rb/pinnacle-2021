import torch
import clip
import base64
import os
import json
from PIL import Image
from io import BytesIO
from functools import cache
from flask import Flask, request
from sklearn.neighbors import KNeighborsClassifier

device = "cuda" if torch.cuda.is_available() else "cpu"

DATA_FILE = 'data.json'


def load_images(file):
    if os.path.exists(file):
        with open(file, 'r') as rawdata:
            return json.loads(rawdata.read())

    return {
        'vector': [],
        'url': [],
    }


def fit_knn(image_data, neighbors=10):
    knn = KNeighborsClassifier(n_neighbors=neighbors)

    knn.fit(image_data['vector'], image_data['url'])

    return knn


@cache
def predict_b64(b64_data):
    img = preprocess(Image.open(BytesIO(base64.b64decode(b64_data)))).unsqueeze(0).to(device)

    with torch.no_grad():
        img_features = model.encode_image(img)

    global knn

    return knn.predict([img_features])


model, preprocess = clip.load("ViT-B/32", device=device)
img_dataset = load_images(DATA_FILE)
knn = fit_knn(img_dataset)

app = Flask(__name__)


@app.route('/upload_image', methods=['POST'])
def upload_image():
    data = request.json

    if 'image' not in data:
        return 'no image :('

    img = preprocess(Image.open(BytesIO(base64.b64decode(data['image'])))).unsqueeze(0).to(device)

    with torch.no_grad():
        img_features = model.encode_image(img)

        with open(DATA_FILE, 'w') as data_file:
            img_dataset['vector'].append(img_features)
            img_dataset['url'].append(data['url'])
            data_file.write(json.dumps(img_dataset))

            global knn
            knn = fit_knn(img_dataset)

    return 'success yuh yuh'


@app.route('/nearest_image', methods=['POST'])
def nearest_image():
    data = request.json

    if 'image' not in data:
        return 'no image!! >:('

    return predict_b64(data['image'])


@app.route('/nearest_text', methods=['POST'])
def nearest_text():
    data = request.json

    if 'text' not in data:
        return 'no text!! >:('

    return predict_b64(data['image'])
