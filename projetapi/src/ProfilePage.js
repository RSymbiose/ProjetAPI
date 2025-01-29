import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { fetchManhwas } from './api'; // Pour les manhwas favoris, ou d'autres données si nécessaire
import { db } from './firebase'; // Assurez-vous d'importer la référence à Firestore
import { collection, getDocs, query, where } from 'firebase/firestore'; // Firebase Firestore imports

function ProfilePage() {
  const [userProfile, setUserProfile] = useState(null);
  const [userManhwas, setUserManhwas] = useState([]);
  const [userReviews, setUserReviews] = useState({}); // Pour stocker les critiques par manhwa
  const [loading, setLoading] = useState(true);

  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      // Récupérer les données utilisateur
      setUserProfile({
        email: user.email,
        username: user.displayName,
      });

      // Exemple : Récupérer les manhwas favoris ou autres données depuis Anilist
      const fetchUserManhwas = async () => {
        const data = await fetchManhwas(); // Tu peux filtrer ou modifier selon les manhwas favoris de l'utilisateur
        setUserManhwas(data);

        // Récupérer les critiques de l'utilisateur pour chaque manhwa depuis Firestore
        const userReviewsData = {};
        const userReviewsQuery = query(collection(db, "user_manhwa_data"), where("userId", "==", user.uid));
        
        const querySnapshot = await getDocs(userReviewsQuery);
        querySnapshot.forEach((doc) => {
          const reviewData = doc.data();
          userReviewsData[reviewData.manhwaId] = reviewData; // Stocker la critique par manhwaId
        });

        setUserReviews(userReviewsData);
        setLoading(false);
      };

      fetchUserManhwas();
    }
  }, [user]);

  if (loading) {
    return <p>Chargement du profil...</p>;
  }

  return (
    <div>
      <h1>Profil de {userProfile.username}</h1>
      <p>Email: {userProfile.email}</p>
      
      <h2>Manhwas favoris :</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {userManhwas.map((manhwa) => (
          <div key={manhwa.id} style={{ border: "1px solid #ddd", padding: "10px", borderRadius: "8px" }}>
            <img src={manhwa.coverImage.large} alt={manhwa.title.english || manhwa.title.romaji} width="150" />
            <p>{manhwa.title.english || manhwa.title.romaji}</p>

            {/* Affichage de la critique, si elle existe */}
            {userReviews[manhwa.id] ? (
              <div>
                <h3>Ma critique :</h3>
                <p><strong>Note : </strong>{userReviews[manhwa.id].rating}</p>
                <p><strong>Commentaire : </strong>{userReviews[manhwa.id].comment}</p>
                <p><strong>Lu ? : </strong>{userReviews[manhwa.id].readStatus ? 'Oui' : 'Non'}</p>
              </div>
            ) : (
              <p>Aucune critique pour ce manhwa</p>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}

export default ProfilePage;
