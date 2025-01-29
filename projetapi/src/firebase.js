// Importer les fonctions nécessaires depuis Firebase SDK
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Pour Firestore
import { getAuth } from "firebase/auth"; // Pour l'authentification

// La configuration Firebase de ton projet
const firebaseConfig = {
  apiKey: "AIzaSyA2Dp6AsNQrWMM7Bw5YXQA0kSgu_hRpycI",
  authDomain: "projetapi-fa3f3.firebaseapp.com",
  projectId: "projetapi-fa3f3",
  storageBucket: "projetapi-fa3f3.firebasestorage.app",
  messagingSenderId: "345360416678",
  appId: "1:345360416678:web:61992bd927c18ba39bd967",
  measurementId: "G-F4YZYTN1HK"
};

// Initialiser Firebase avec la configuration
const app = initializeApp(firebaseConfig);

// Initialiser Firestore et Auth
const db = getFirestore(app); // Firestore
const auth = getAuth(app); // Authentification

// Exporter db et auth pour les utiliser ailleurs dans l'application
export { db, auth };