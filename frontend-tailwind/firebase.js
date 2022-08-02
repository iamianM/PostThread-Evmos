// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAPfXj8T1iJ37Xlw7FTG-tuJJKilLG-etg",
    authDomain: "postthread-b45d2.firebaseapp.com",
    projectId: "postthread-b45d2",
    storageBucket: "postthread-b45d2.appspot.com",
    messagingSenderId: "473572821395",
    appId: "1:473572821395:web:256ac4d5a8585160bc8066",
    measurementId: "G-HH5SHWLGRS"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore()
const storage = getStorage()

export { app, db, storage }