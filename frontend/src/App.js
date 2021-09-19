import './App.css';
import MainView from './main_views/MainView';
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import ImagePicker from './main_views/ImagePicker'
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
      chosenImage: null,
      modalOpen: true,
      isNewUser: false
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
            this.setState({isNewUser: true})

            setDoc(docRef, {
              uuid: result.user.uid,
              images_seen: {},
              posts: [],
              most_valuable_img: null
            })
          } else if (Object.keys(doc.data().images_seen).length === 0 && doc.data().posts.length === 0) {
            console.log('is new user?')
            this.setState({isNewUser: true})
          } else {
            console.log(Object.keys(doc.data().images_seen).length === 0, doc.data().posts.length)
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

  closeModal() {
    this.setState({modalOpen: false});
  }

  selectInitImage(image) {
    this.setState({chosenImage: image, isNewUser: false}, () => {
      console.log(this.state.chosenImage)
    })
  }

  render() {
    const { attemptedSignIn, signedIn } = this.state;

    if (!attemptedSignIn) return <div className="App"><NotSignedIn message="Please sign in with the Google popup."/></div>; // User hasn't attempted to sign in
    else if (!signedIn) return <div className="App"><NotSignedIn message="Couldn't sign you in. Check the console for more info."/></div>; // User couldn't sign in
    else { // Successfully signed user in 
      if (this.state.isNewUser) {
        return (
          <div className="App">
            <ImagePicker open={this.state.modalOpen} closeModalCallback={() => this.closeModal()} chooseImage={(image) => this.selectInitImage(image)} />
          </div>
        )
      }

      return (
        <div className="App">
          <MainView />
        </div>
      )
    }
    
  }
}

export default App;
