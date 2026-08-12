import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [utilisateur, setUtilisateur] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            setLoading(false);
            return;
        }

        authService.getProfil()
            .then(data => setUtilisateur(data))
            .catch(() => {
                localStorage.removeItem('authToken');
                setUtilisateur(null);
            })
            .finally(() => setLoading(false));
    }, []);

    const login = async (email, motDePasse) => {
        const { token, utilisateur } = await authService.login({ email, motDePasse });
        localStorage.setItem('authToken', token);
        setUtilisateur(utilisateur);
        return utilisateur;
    };

    const register = async (nom, email, motDePasse) => {
        const { token, utilisateur } = await authService.register({ nom, email, motDePasse });
        localStorage.setItem('authToken', token);
        setUtilisateur(utilisateur);
        return utilisateur;
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        setUtilisateur(null);
    };

    return (
        <AuthContext.Provider value={{ utilisateur, loading, login, register, logout, estConnecte: !!utilisateur }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
    }
    return context;
};