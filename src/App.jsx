import React from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Accueil from "./pages/Accueil";
import LieuxDétails from "./pages/LieuxDétails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Carte from "./components/Carte";
import NavBar from "./components/layout/NavBar";

function App(){
  return (
    <ThemeProvider>
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <NavBar/>
          <Routes>
            <Route path="/" element={<Accueil />} />
            <Route path="/carte" element={<Carte />} />
            <Route path="/lieu/:id" element={<LieuxDétails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
  )
}

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-gray-600 mb-4">Page non trouvée</p>
      <a href="/" className="text-blue-500 hover:underline">Retour à l'accueil</a>
    </div>
  </div>
);

export default App;