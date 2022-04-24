// Import the functions you need from the SDKs you need

import firebase from 'firebase/app';

import 'firebase/analytics';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/analytics';
import 'firebase/database';
import 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD9ciRGxCzJxK3kk-rU0-e4AK-xm_1mKkU",
  authDomain: "react-firebase-draw.firebaseapp.com",
  databaseURL: "https://react-firebase-draw-default-rtdb.firebaseio.com",
  projectId: "react-firebase-draw",
  storageBucket: "react-firebase-draw.appspot.com",
  messagingSenderId: "235503594236",
  appId: "1:235503594236:web:866935c9b4d85fd0a8c579"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

const auth = firebase.auth();
const db = firebase.firestore();
const database = firebase.database();

//gia lap database
// connectAuthEmulator(auth, "http://localhost:9099");
// if(window.location.hostname === 'localhost'){
//   auth.useEmulator('http://localhost:9099');
//   db.useEmulator('localhost', '8080');
//   database.useEmulator('localhost','9000');
// }

export { db, auth, database };
export default firebase;


