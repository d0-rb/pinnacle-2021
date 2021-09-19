import copy

import torch
import clip
import base64
import os
import json
import firebase_admin
import numpy as np
from PIL import Image
from io import BytesIO
from flask import Flask, request
from flask_cors import CORS, cross_origin
from flask_classful import FlaskView, route
from firebase_admin import credentials, firestore

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
cred = credentials.Certificate("pinnacle-65730-firebase-adminsdk-ikwmu-ae1f6474f4.json")
firebase_admin.initialize_app(cred)


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
        self.db = firestore.client()

    def save_data(self):
        with open(self.DATA_FILE, 'w') as data_file:
            data_file.write(json.dumps(self.img_dataset))

    @route('/delete_image', methods=['POST'])
    @cross_origin()
    def delete_image(self):
        data = request.json

        if 'img_uuid' not in data:
            return json.dumps({
                'success': False,
                'error': 'no img_uuid >:((',
            })

        self.db.collection('images').document(data['img_uuid']).delete()

        for existing_img_uuid, existing_img_data in self.img_dataset.items():
            for pair_idx, (paired_img_uuid, paired_img_distance) in enumerate(existing_img_data['distances']):
                if paired_img_uuid == data['img_uuid']:
                    del existing_img_data['distances'][pair_idx]
                    break

        del self.img_dataset[data['img_uuid']]

        self.save_data()

        return json.dumps({
            'success': True,
        })

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
                'error': 'no uuid!!!!!!!! :(',
            })

        firebase_img = self.db.collection('images').add(data)
        user = self.db.collection('users').document(data['uuid'])
        userDict = copy.deepcopy(user.get().to_dict())
        data['img_uuid'] = firebase_img[1].id
        userDict['images_seen'][data['img_uuid']] = True
        userDict['posts'].append(data['img_uuid'])
        user.set({'images_seen': userDict['images_seen'], 'posts': userDict['posts']}, merge=True)

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
                        img_data['distances'].insert(cur_idx, (data['img_uuid'], cur_distance))
                        inserted = True
                        break

                if not inserted:
                    img_data['distances'].append((data['img_uuid'], cur_distance))

            img_distances_sorted = sorted(img_distances_raw, key=lambda item: item[1])
            self.img_dataset[data['img_uuid']] = {
                'vector': img_features,
                'distances': img_distances_sorted
            }

            self.save_data()

        return json.dumps({
            'success': True,
            'result': data['img_uuid'],
        })

    @route('/nearest_image', methods=['POST'])
    @cross_origin()
    def nearest_image(self):
        data = request.json

        seen = 0
        limit = data['limit'] if 'limit' in data else 0

        if 'uuid' in data:
            users = self.db.collection('users').where('uuid', '==', data['uuid']).get()
            user = users[0].to_dict()
            seen = user['images_seen'].keys()

        if 'img_uuid' in data:
            print(data['img_uuid'])
            print(self.img_dataset.keys())
            print(data['img_uuid'] in self.img_dataset)
            print(data['img_uuid'] in self.img_dataset.keys())
            print(self.img_dataset[data['img_uuid']])
            img_uuids = self.predict_existing(data['img_uuid'], seen, limit)
        else:
            if 'image' not in data:
                return json.dumps({
                    'success': False,
                    'error': 'u rly have the nerve to ping this endpoint without including a uuid or image in the body'
                })

            img = self.preprocess(Image.open(BytesIO(base64.b64decode(data['image'])))).unsqueeze(0).to(self.device)
            features = self.model.encode_image(img).squeeze().detach().tolist()

            img_uuids = self.predict_new(features, seen, limit)

        images = []
        print(img_uuids)
        for img_uuid in img_uuids:
            print(self.db.collection('images').document(img_uuid).get())
            images.append(self.db.collection('images').document(img_uuid).get().to_dict()['image'])

        return json.dumps({
            'success': True,
            'result': {
                'img_uuid': img_uuids,
                'img': images,
            },
        })

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


    @route('/mark_seen', methods=['POST'])
    @cross_origin()
    def mark_seen(self):
        data = request.json

        if 'uuid' not in data:
            return json.dumps({
                'success': False,
                'error': 'no uuid smh',
            })
        elif 'img_uuid' not in data:
            return json.dumps({
                'success': False,
                'error': 'no img_uuid pls send it :(',
            })

        user = self.db.collection('users').document(data['uuid'])
        userDict = copy.deepcopy(user.get().to_dict())
        userDict['images_seen'][data['img_uuid']] = True
        user.set({'images_seen': userDict['images_seen']}, merge=True)

        return json.dumps({
            'success': True,
        })


    @route('/mark_valuable_image', methods=['POST'])
    @cross_origin()
    def mark_valuable_image(self):
        data = request.json
        user = self.db.collection('users').document(data['uuid'])
        user.set({'most_valuable_img': data['img_uuid']}, merge=True)

        return json.dumps({
            'success': True,
        })


    @route('/get_valuable_image', methods=['GET'])
    @cross_origin()
    def get_valuable_image(self):
        data = request.json
        user = self.db.collection('users').document(data['uuid']).get().to_dict()

        return json.dumps({
            'success': True,
            'result': user['most_valuable_img'] if 'most_valuable_img' in user else None
        })


    @route('/get_user_images', methods=['POST'])
    @cross_origin()
    def get_user_images(self):
        entry = request.get_json()
        uuid = entry['uuid']
        docs = self.db.collection('images').where('uuid', '==', uuid).get()
        images = []
        for doc in docs:
            image = doc.to_dict()
            image['img_uuid'] = doc.id
            images.append(image)

        return json.dumps({
            'success': True,
            'result': images
        })


    def predict_new(self, embedding, seen=(), limit=0):
        img_distances = {}
        for img_uuid, img_data in self.img_dataset.items():
            if img_uuid in seen:
                continue

            img_distances[img_uuid] = distance(embedding, img_data['vector'])

        nearest_imgs = [img_uuid for img_uuid, _ in sorted(img_distances.items(), key=lambda item: item[1])]

        limit = limit if limit > 0 else len(nearest_imgs)

        return nearest_imgs[0:limit]

    def predict_existing(self, img_uuid, seen=(), limit=0):
        if img_uuid not in self.img_dataset:
            return json.dumps({
                'success': False,
                'error': 'This image has not been uploaded to the api yet!'
            })

        nearest_imgs = []
        for img_uuid, img_distance in self.img_dataset[img_uuid]['distances']:
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
