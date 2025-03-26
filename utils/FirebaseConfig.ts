import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore/lite";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
apiKey: "AIzaSyCi2v5jyYD7LFB4lbTN5aHWHBEC5ueTkiM",
authDomain: "proyectopos-db578.firebaseapp.com",
projectId: "proyectopos-db578",
storageBucket: "proyectopos-db578.firebasestorage.app",
messagingSenderId: "793262108082",
appId: "1:793262108082:web:1db24f80dbcb1aa94848ab"
};

export const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
export default app;