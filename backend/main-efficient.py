import torch
import clip
import base64
import os
import json
import numpy as np
from PIL import Image
from io import BytesIO
from flask import Flask, request
from flask_cors import CORS, cross_origin
from flask_classful import FlaskView, route

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'


def load_images(file):
    if os.path.exists(file):
        with open(file, 'r') as raw_data:
            return json.loads(raw_data.read())

    return {}


def distance(vec1, vec2):
    np1 = np.array(vec1)
    np2 = np.array(vec2)
    return np.linalg.norm(np2-np1)


class EngineAPI(FlaskView):
    DATA_FILE = 'data.json'

    def __init__(self):
        super().__init__()

        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model, self.preprocess = clip.load("ViT-B/32", device=self.device)
        self.img_dataset = load_images(self.DATA_FILE)

    def save_data(self):
        with open(self.DATA_FILE, 'w') as data_file:
            data_file.write(json.dumps(self.img_dataset))

    @route('/delete_image', methods=['POST'])
    @cross_origin()
    def delete_image(self):
        data = request.json

        if 'uuid' not in data:
            return json.dumps({
                'success': False,
                'error': 'no uuid >:((',
            })

        # TODO: DELETE FROM GCP

        del self.img_dataset[data['uuid']]
        self.save_data()

    @route('/upload_image', methods=['POST'])
    @cross_origin()
    def upload_image(self):
        data = request.json

        if 'image' not in data:
            return json.dumps({
                'success': False,
                'error': 'no image :(',
            })
        elif 'uuid' not in data:
            return json.dumps({
                'success': False,
                'error': 'no uuid!! :(',
            })

        img = self.preprocess(Image.open(BytesIO(base64.b64decode(data['image'])))).unsqueeze(0).to(self.device)

        with torch.no_grad():
            img_features = self.model.encode_image(img).squeeze().tolist()
            img_distances_raw = []

            for img_uuid, img_data in self.img_dataset.items():
                cur_distance = distance(img_data['vector'], img_features)
                img_distances_raw.append((img_uuid, cur_distance))

                inserted = False
                for cur_idx, (_, neighbor_distance) in enumerate(img_data['distances']):
                    if cur_distance < neighbor_distance:
                        img_data['distances'].insert(cur_idx, (data['uuid'], cur_distance))
                        inserted = True
                        break

                if not inserted:
                    img_data['distances'].append((data['uuid'], cur_distance))

            img_distances_sorted = sorted(img_distances_raw, key=lambda item: item[1])
            self.img_dataset[data['uuid']] = {
                'vector': img_features,
                'distances': img_distances_sorted
            }

            self.save_data()

        return json.dumps({
            'success': True
        })

    @route('/nearest_image', methods=['POST'])
    @cross_origin()
    def nearest_image(self):
        data = request.json

        seen = data['seen'] if 'seen' in data else ()
        limit = data['limit'] if 'limit' in data else 0

        if 'uuid' not in data:
            if 'image' not in data:
                return json.dumps({
                    'success': False,
                    'error': 'u rly have the nerve to ping this endpoint without including a uuid or image in the body'
                })

            img = self.preprocess(Image.open(BytesIO(base64.b64decode(data['image'])))).unsqueeze(0).to(self.device)
            features = self.model.encode_image(img).squeeze().detach().tolist()
            return self.predict_new(features, seen, limit)

        return self.predict_existing(data['uuid'], seen, limit)

    @route('/nearest_text', methods=['POST'])
    @cross_origin()
    def nearest_text(self):
        data = request.json

        if 'text' not in data:
            return json.dumps({
                'success': False,
                'error': 'SEND TEXT!!! WHY DID YOU PING THE NEAREST_TEXT ENDPOINT WITHOUT SENDING TEXT IN THE BODY!!!!!'
            })

        seen = data['seen'] if 'seen' in data else ()
        limit = data['limit'] if 'limit' in data else 0

        text = clip.tokenize([data['text']]).cpu()
        features = self.model.encode_text(text).squeeze().detach().tolist()
        return self.predict_new(features, seen, limit)

    def predict_new(self, embedding, seen=(), limit=0):
        img_distances = {}
        for img_uuid, img_data in self.img_dataset.items():
            if img_uuid in seen:
                continue

            img_distances[img_uuid] = distance(embedding, img_data['vector'])

        nearest_imgs = [img_uuid for img_uuid, _ in sorted(img_distances.items(), key=lambda item: item[1])]

        limit = limit if limit > 0 else len(nearest_imgs)

        return nearest_imgs[0:limit]

    def predict_existing(self, uuid, seen=(), limit=0):
        if uuid not in self.img_dataset:
            return json.dumps({
                'success': False,
                'error': 'This image has not been uploaded to the api yet!'
            })

        nearest_imgs = []
        for img_uuid, img_distance in self.img_dataset[uuid]['distances']:
            if img_uuid in seen:
                continue

            if limit == 0 or len(nearest_imgs) < limit:
                nearest_imgs.append(img_uuid)
            else:
                break

        return nearest_imgs


EngineAPI.register(app, route_base='/')


if __name__ == '__main__':
    app.run(host='0.0.0.0')
