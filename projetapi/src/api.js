import axios from "axios";

const API_URL = "https://graphql.anilist.co";

export const fetchManhwas = async () => {
    const query = `
      query {
        Page(perPage: 10) {
          media(type: MANGA, countryOfOrigin: "KR", sort: POPULARITY_DESC) {
            id
            title {
              romaji
              english
            }
            coverImage {
              large
            }
            averageScore
            description
          }
        }
      }
    `;
  
    try {
      const response = await axios.post(API_URL, { query });
      
      // Afficher la réponse complète dans la console pour debugging
      console.log(response.data);
  
      // Vérifier si la réponse contient les données attendues
      const manhwas = response.data?.data?.Page?.media;
  
      if (manhwas && manhwas.length > 0) {
        return manhwas;
      } else {
        console.error("Aucun manhwa trouvé ou données manquantes.");
        return [];
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des manhwas :", error.message);
      return [];
    }
  };
  
  

// Fonction pour récupérer les détails d'un manhwa par son ID
export const fetchManhwaById = async (manhwaId) => {
    const query = `
      query ($id: Int) {
        Media(id: $id, type: MANGA) {
          title {
            english
            romaji
          }
          coverImage {
            large
          }
          description
        }
      }
    `;
    
    const variables = { id: manhwaId };
  
    try {
      const response = await axios.post(API_URL, { query, variables });
      return response.data.data.Media;
    } catch (error) {
      console.error("Erreur lors de la récupération du manhwa par ID :", error);
      return null;
    }
  };