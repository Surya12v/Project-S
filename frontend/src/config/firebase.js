// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCNQH32sgb_6ZavB2aPoy18MrObAADYbA8",
  authDomain: "project--s-a8bf0.firebaseapp.com",
  projectId: "project--s-a8bf0",
  storageBucket: "project--s-a8bf0.firebasestorage.app",
  messagingSenderId: "560251743083",
  appId: "1:560251743083:web:9b157e1bbf06623a47ba2e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export { app };