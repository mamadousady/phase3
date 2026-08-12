import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [motDePasse, setMotDePasse] = useState('');
    const [erreur, setErreur] = useState(null);
    const [chargement, setChargement] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErreur(null);
        setChargement(true);
        try {
            await login(email, motDePasse);
            navigate('/');
        } catch (err) {
            setErreur(err.message || 'Connexion impossible.');
        } finally {
            setChargement(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Connexion</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                        <input type="password" value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
                    </div>
                    {erreur && <p className="text-red-600 text-sm">{erreur}</p>}
                    <button type="submit" disabled={chargement}
                        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50">
                        {chargement ? 'Connexion...' : 'Se connecter'}
                    </button>
                </form>
                <p className="text-sm text-gray-600 mt-4 text-center">
                    Pas de compte ? <Link to="/register" className="text-blue-500 hover:underline">Créer un compte</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;