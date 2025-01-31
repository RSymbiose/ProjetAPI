// Importer les fonctions nécessaires depuis Firebase SDK
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Pour Firestore
import { getAuth } from "firebase/auth"; // Pour l'authentification

// La configuration Firebase de ton projet


// Initialiser Firebase avec la configuration
const app = initializeApp(firebaseConfig);

// Initialiser Firestore et Auth
const db = getFirestore(app); // Firestore
const auth = getAuth(app); // Authentification

// Exporter db et auth pour les utiliser ailleurs dans l'application
export { db, auth };
