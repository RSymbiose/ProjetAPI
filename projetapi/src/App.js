import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { useState, useEffect } from "react";
import { fetchManhwas } from "./api";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase"; // Assurez-vous que ce chemin est correct selon votre structure de projet
import { setDoc, doc } from "firebase/firestore";
import ProfilePage from './ProfilePage'; // Page de profil utilisateur

function App() {
  const [manhwas, setManhwas] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState({}); // Un objet pour stocker les critiques des manhwas

  // Récupérer les manhwas de l'API Anilist
  useEffect(() => {
    const getManhwas = async () => {
      const data = await fetchManhwas();
      setManhwas(data);
    };
    getManhwas();
  }, []);

  // Vérifier si un utilisateur est connecté
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Gérer la connexion
  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setError(error.message);
    }
  };

  // Gérer l'inscription
  const handleRegister = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setError(error.message);
    }
  };

  // Gérer la déconnexion
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsLoggedIn(false); // Déconnecter l'utilisateur localement
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }
  };

  // Mettre à jour la critique pour un manhwa spécifique
  const handleReviewChange = (manhwaId, field, value) => {
    setReviews(prevReviews => ({
      ...prevReviews,
      [manhwaId]: {
        ...prevReviews[manhwaId],
        [field]: value
      }
    }));
  };

  // Soumettre la critique du manhwa
  const handleSubmitReview = async (manhwaId) => {
    const { comment, rating, readStatus } = reviews[manhwaId] || {};

    if (!comment || rating === 0) {
      alert("Veuillez ajouter un commentaire et une note !");
      return;
    }

    const user = auth.currentUser;
    if (user) {
      try {
        // Ajouter ou mettre à jour la critique dans Firestore pour cet utilisateur et ce manhwa
        const userManhwaRef = doc(db, "user_manhwa_data", `${user.uid}_${manhwaId}`);
        await setDoc(userManhwaRef, {
          userId: user.uid,
          manhwaId: manhwaId,
          comment: comment,
          rating: rating,
          readStatus: readStatus,
        });
        alert("Critique envoyée !");
        // Réinitialiser les champs après envoi
        setReviews(prevReviews => ({
          ...prevReviews,
          [manhwaId]: {
            comment: '',
            rating: 0,
            readStatus: false
          }
        }));
      } catch (error) {
        console.error("Erreur lors de l'envoi de la critique : ", error);
      }
    } else {
      alert("Vous devez être connecté pour envoyer un commentaire !");
    }
  };

  return (
    <Router>
      <div>
        <h1>Bienvenue sur ProjetAPI 🎉</h1>
        <nav>
          <Link to="/">Accueil</Link> | 
          {isLoggedIn ? (
            <>
              <Link to="/profile">Profil</Link> | {/* Lien vers la page de profil */}
              <button onClick={handleLogout}>Déconnexion</button>
            </>
          ) : (
            <>
              <button onClick={handleLogin}>Login</button>
              <button onClick={handleRegister}>Register</button>
            </>
          )}
        </nav>

        <Routes>
          <Route path="/" element={<div>
            {!isLoggedIn ? (
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                />
                <button onClick={handleLogin}>Login</button>
                <button onClick={handleRegister}>Register</button>
                {error && <p style={{ color: 'red' }}>{error}</p>} {/* Affichage des erreurs */}
              </div>
            ) : (
              <div>
                <p>Voici les manhwas les plus populaires :</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
                  {manhwas.map((manhwa) => (
                    <div key={manhwa.id} style={{ border: "1px solid #ddd", padding: "10px", borderRadius: "8px" }}>
                      <img src={manhwa.coverImage.large} alt={manhwa.title.english || manhwa.title.romaji} width="150" />
                      <p>{manhwa.title.english || manhwa.title.romaji}</p>

                      {/* Formulaire de critique */}
                      <textarea
                        placeholder="Ajouter un commentaire"
                        value={reviews[manhwa.id]?.comment || ''}
                        onChange={(e) => handleReviewChange(manhwa.id, 'comment', e.target.value)}
                        rows="4"
                        style={{ width: "100%" }}
                      />
                      <br />
                      <input
                        type="number"
                        placeholder="Note (1 à 5)"
                        value={reviews[manhwa.id]?.rating || 0}
                        onChange={(e) => handleReviewChange(manhwa.id, 'rating', Number(e.target.value))}
                        min="1"
                        max="5"
                      />
                      <br />
                      <label>
                        Lu ?
                        <input
                          type="checkbox"
                          checked={reviews[manhwa.id]?.readStatus || false}
                          onChange={(e) => handleReviewChange(manhwa.id, 'readStatus', e.target.checked)}
                        />
                      </label>
                      <br />
                      <button onClick={() => handleSubmitReview(manhwa.id)}>Envoyer ma critique</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>} />
          
          {/* Route vers la page de profil */}
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;