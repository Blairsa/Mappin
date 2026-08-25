import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDYj5v8v8j6o3eYwZoTJoX0b-8ixu49Zx8",
  authDomain: "mappin-14d4d.firebaseapp.com",
  projectId: "mappin-14d4d",
  storageBucket: "mappin-14d4d.firebasestorage.app",
  messagingSenderId: "638312610226",
  appId: "1:638312610226:web:e97242247a34f273b24cab",
  measurementId: "G-XCCYR413C9"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export const analytics = getAnalytics(app);
