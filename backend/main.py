import torch
import clip
import base64
import os
import json
from PIL import Image
from io import BytesIO
from functools import lru_cache
from flask import Flask, request
from flask_cors import CORS, cross_origin
from sklearn.neighbors import KNeighborsClassifier


device = "cuda" if torch.cuda.is_available() else "cpu"
model, preprocess = clip.load("ViT-B/32", device=device)

DATA_FILE = 'data.json'


def load_images(file):
    if os.path.exists(file):
        with open(file, 'r') as raw_data:
            return json.loads(raw_data.read())

    global model, preprocess
    img = preprocess(Image.open('CLIP.png')).unsqueeze(0).to(device)

    return {
        'vector': [model.encode_image(img)[0].detach().tolist()],
        'url': ['https://www.seekpng.com/png/detail/1-16813_dog-png-sit-dog.png'],
    }


def fit_knn(image_data, neighbors=4):
    knn_classifier = KNeighborsClassifier(n_neighbors=neighbors)

    knn_classifier.fit(image_data['vector'], image_data['url'])

    return knn_classifier


@lru_cache(maxsize=None)
def predict(data, image=True):
    if image:
        img = preprocess(Image.open(BytesIO(base64.b64decode(data)))).unsqueeze(0).to(device)

        with torch.no_grad():
            features = model.encode_image(img).squeeze().detach().tolist()
    else:
        with torch.no_grad():
            text = clip.tokenize([data]).cpu()
            features = model.encode_text(text).squeeze().detach().tolist()

    global knn, img_dataset

    nearest_idx = knn.kneighbors([features])[1].tolist()[0]
    nearest_urls = [img_dataset['url'][i] for i in nearest_idx]

    return nearest_urls


img_dataset = load_images(DATA_FILE)
knn = fit_knn(img_dataset)

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'



@app.route('/upload_image', methods=['POST'])
@cross_origin()
def upload_image():
    data = request.json

    if 'image' not in data:
        return 'no image :('

    img = preprocess(Image.open(BytesIO(base64.b64decode(data['image'])))).unsqueeze(0).to(device)

    with torch.no_grad():
        img_features = model.encode_image(img)

        img_dataset['vector'].append(img_features.squeeze().tolist())
        img_dataset['url'].append(data['url'])

        global knn
        knn = fit_knn(img_dataset)

        with open(DATA_FILE, 'w') as data_file:
            data_file.write(json.dumps(img_dataset))

    return 'success yuh yuh'


@app.route('/nearest_image', methods=['POST'])
@cross_origin()
def nearest_image():
    data = request.json

    if 'image' not in data:
        return 'no image!! >:('

    return json.dumps({
        'success': True,
        'result': predict(data['image'])
    })


@app.route('/nearest_text', methods=['POST'])
@cross_origin()
def nearest_text():
    data = request.json

    if 'text' not in data:
        return 'no text!! >:('

    return json.dumps({
        'success': True,
        'result': predict(data['text'], image=False)
    })


if __name__ == '__main__':
    app.run(host='0.0.0.0')
