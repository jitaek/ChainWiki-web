import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import './index.css';
import './skeleton.css';
import * as firebase from 'firebase';

// Initialize Firebase
var config = {
apiKey: "AIzaSyBD9eX7ABB0Xu1N6CnSdKL-bnsNF5WgLtc",
authDomain: "chainchronicle-ea233.firebaseapp.com",
databaseURL: "https://chainchronicle-ea233.firebaseio.com",
projectId: "chainchronicle-ea233",
storageBucket: "chainchronicle-ea233.appspot.com",
messagingSenderId: "1008757887866"
};

firebase.initializeApp(config);

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
