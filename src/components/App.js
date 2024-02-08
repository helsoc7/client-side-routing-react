import React from "react";
import Home from "./Home";
import About from "./About";
import Login from "./Login";
import MeinBereich from "./MeinBereich";
import { Routes, Route } from "react-router-dom";

function App() {
 return (
    <div className="App">
      // Unsere Liste von Routen
      <Routes>
        <Route path='/' element={ <Home/> } />
        <Route path='about' element={ <About/> } />
        <Route path='login' element={ <Login/> } />
        <Route path='myspace' element={ <MeinBereich/> } />
      </Routes>
    </div>
  );
}

export default App