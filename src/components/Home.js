import React from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  let navigate = useNavigate();

  return (
    <div>
      <h2>Home</h2>
      <p>Willkommen auf der Startseite! Hier könnten wichtige Informationen oder Features hervorgehoben werden.</p>
      <button onClick={() => navigate('/about')}>Über Uns</button>
      <button onClick={() => navigate('/login')}>Login</button>
    </div>
  );
}

export default Home;
