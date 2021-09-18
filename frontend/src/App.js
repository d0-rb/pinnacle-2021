import './App.css';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import React from 'react';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBfo7AffazD2FcvMGoRPVARtyPj94xuxTo",
  authDomain: "pinnacle-65730.firebaseapp.com",
  projectId: "pinnacle-65730",
  storageBucket: "pinnacle-65730.appspot.com",
  messagingSenderId: "471985174144",
  appId: "1:471985174144:web:dbfd68e341d83b1b6c9865",
  measurementId: "G-ZM80Y1JPVG"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const provider = new GoogleAuthProvider();

class App extends React.Component {
  constructor(props) {
    super(props);

    this.auth = getAuth();
    signInWithPopup(this.auth, provider);
  }

  render() {
    return (
      <div className="App">
        
      </div>
    );
  }
}

export default App;
