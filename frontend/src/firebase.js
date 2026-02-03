import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAT8Pn2ivUrLF3EDiTUDBbAsxNJzzW6Vso",
    authDomain: "glosa-bharat-6ba01.firebaseapp.com",
    projectId: "glosa-bharat-6ba01",
    storageBucket: "glosa-bharat-6ba01.firebasestorage.app",
    messagingSenderId: "269757965950",
    appId: "1:269757965950:web:2c5939d52f3915a320da2f",
    measurementId: "G-CMCTHWNPGZ"
};

console.log("Initializing Firebase with Project ID:", firebaseConfig.projectId);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Configure Google Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

export { auth, googleProvider };