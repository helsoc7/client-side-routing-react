import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function MeinBereich() {
  let navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [userImage, setUserImage] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      sessionStorage.setItem('userToken', token);
      window.history.replaceState(null, null, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    // Funktion, um Nutzerdaten zu holen
    const fetchUserData = async () => {
      // Token aus sessionStorage statt localStorage holen
      const token = sessionStorage.getItem('userToken');
      console.log(token);
      try {
        const response = await fetch('http://localhost:4000/userData', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Fehler beim Abrufen der Nutzerdaten');
        }

        const data = await response.json();
        setUserName(data.name);
        setUserImage(data.profileImage);
      } catch (error) {
        console.error(error);
        // Optional: Umleiten zum Login, wenn der Token ungültig ist
        navigate('/login');
      }
    };

    fetchUserData();
  }, [navigate]); // Abhängigkeiten hinzufügen, um Warnungen zu vermeiden

  return (
    <div>
      <h2>Mein Bereich</h2>
      {userName && <p>Willkommen, {userName}!</p>}
      {userImage && <img src={userImage} alt="Profilbild" />}
      <button onClick={() => navigate('/about')}>Über Uns</button>
    </div>
  );
}

export default MeinBereich;
