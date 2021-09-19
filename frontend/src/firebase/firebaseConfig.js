import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from '@firebase/firestore'

const firebaseConfig = {
    apiKey: "AIzaSyBfo7AffazD2FcvMGoRPVARtyPj94xuxTo",
    authDomain: "pinnacle-65730.firebaseapp.com",
    projectId: "pinnacle-65730",
    storageBucket: "pinnacle-65730.appspot.com",
    messagingSenderId: "471985174144",
    appId: "1:471985174144:web:dbfd68e341d83b1b6c9865",
    measurementId: "G-ZM80Y1JPVG"
};

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app);
export const db = getFirestore(app)