import './App.css';
import MainView from './main_views/MainView';
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db } from './firebase/firebaseConfig'
import { doc, setDoc, getDoc } from "firebase/firestore"; 
import { storeUserUid, store } from './redux/redux';
import React from 'react';
import NotSignedIn from './auth_views/NotSignedIn';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional


class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      attemptedSignIn: false,
      signedIn: false,
    }
  }


  componentDidMount() {
    const provider = new GoogleAuthProvider();

    signInWithPopup(auth, provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        this.setState({signedIn: true, attemptedSignIn: true});
        store.dispatch(storeUserUid(result.user.uid));
        
        const docRef = doc(db, "users", result.user.uid);
        getDoc(docRef).then((doc) => {
          
          if (!doc.exists()) {
            setDoc(docRef, {
              uuid: result.user.uid,
              images_seen: {},
              posts: [],
              most_valuable_img: null
            })
          }
        })

      }).catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        
        console.error(errorCode, "Couldn't sign user in: ", errorMessage, error);
        this.setState({signedIn: false, attemptedSignIn: true});
      });

  }

  render() {
    const { attemptedSignIn, signedIn } = this.state;

    if (!attemptedSignIn) return <div className="App"><NotSignedIn message="Please sign in with the Google popup."/></div>; // User hasn't attempted to sign in
    else if (!signedIn) return <div className="App"><NotSignedIn message="Couldn't sign you in. Check the console for more info."/></div>; // User couldn't sign in
    else { // Successfully signed user in
      return (
        <div className="App">
          <MainView />
        </div>
      )
    }
    
  }
}

export default App;
