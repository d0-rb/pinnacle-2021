import './App.css';
import SignIn from './SignIn';
import MainPage from './main';
import GoogleButton from 'react-google-button'
import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, signInWithPopup, signOut, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";
import React from 'react';
import Button from '@mui/material/Button';

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

class App extends React.Component {
  constructor(props) {
    super(props);

    this.auth = getAuth();
    this.provider = new GoogleAuthProvider();
    this.state = {
      signedIn: false,
    }

    signInWithPopup(this.auth, this.provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);

        this.state.user = result.user;
        this.state.token = credential.accessToken;
      }).catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
      });
  }
  /**
   * Don't forget to stop listening for authentication state changes
   * when the component unmounts.
   */
  componentWillUnmount() {
    this.authSubscription();
  }

  googleSignOut(event) {
    signOut();
  }

  googleSignIn(event) {
    setPersistence(this.auth, 'local')
      .then(function() {
        signInWithPopup(this.auth, this.provider)
          .then((result) => {
            // This gives you a Google Access Token. You can use it to access the Google API.
            const credential = GoogleAuthProvider.credentialFromResult(result);
    
            this.state.user = result.user;
            this.state.token = credential.accessToken;
          }).catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            // The email of the user's account used.
            const email = error.email;
            // The AuthCredential type that was used.
            const credential = GoogleAuthProvider.credentialFromError(error);
            // ...
          });
      }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
    });
  }

  render() {
    return (
      <div className="App">
        <MainPage user={this.state.user} />
      </div>
    );
  }
}

export default App;
