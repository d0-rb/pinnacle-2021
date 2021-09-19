import copy
import json
import firebase_admin
from firebase_admin import credentials, auth, firestore
import requests
import datetime
import base64
from flask import Flask, request, Response
from google.cloud import storage

app = Flask(__name__)

cred = credentials.Certificate("pinnacle-65730-firebase-adminsdk-ikwmu-ae1f6474f4.json")
firebase_admin.initialize_app(cred)
db = firestore.client()
imagecount = 0

@app.route('/add_image', methods=['POST'])
def add_image():
    entry = request.get_json()
    db.collection('images').add(entry)
    return "Success!"

@app.route('/next_nearest', methods=['POST'])
def next_nearest():
    entry = request.get_json()
    image = entry['image']
    uid = entry["uid"]
    users = db.collection('users').where("uid", "==", uid).get()
    user = users[0].to_dict()
    nearestImagesIids = []
    for i in nearestImagesIids:
        if (user["images_seen"].contains(i)):
            continue
        else:
            return i
    return "none available"

@app.route('/mark_seen', methods=['POST'])
def mark_seen():
    entry = request.get_json()
    uid = entry["uid"]
    iid = entry["iid"]
    user = db.collection("users").document(uid)
    userDict = copy.deepcopy(user.get().to_dict())
    userDict["images_seen"][iid] = True
    user.set({"images_seen": userDict}, merge=True)

    return "Success!"

@app.route('/get_user_images', methods=['POST'])
def get_user_images():
    entry = request.get_json()
    uid = entry["uid"]
    docs = db.collection('images').where("uid", "==", uid).get()
    images = []
    for i in docs:
        image = i.to_dict()
        image["iid"] = i.id
        images.append(i)
    return images

@app.route('/delete_image', methods=['POST'])
def delete_image():
    entry = request.get_json()
    iid = entry["iid"]
    db.collection("images").document(iid).delete()
    return "Deleted!"






if __name__ == '__main__':
    # writer_function()
    # readertest()
    app.run(host='0.0.0.0')