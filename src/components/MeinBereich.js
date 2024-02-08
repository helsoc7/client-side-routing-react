import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function MeinBereich() {
  let navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [userImage, setUserImage] = useState('');

  useEffect(() => {
    // Funktion, um Nutzerdaten zu holen
    const fetchUserData = async () => {
      const token = localStorage.getItem('userToken');
      const response = await fetch('http://localhost:4000/userData', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setUserName(data.name);
        setUserImage(data.profileImage);
      } else {
        console.error('Fehler beim Abrufen der Nutzerdaten');
      }
    };

    fetchUserData();
  }, []); // Leeres Array, damit dieser Effekt nur einmal beim ersten Rendering läuft

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
