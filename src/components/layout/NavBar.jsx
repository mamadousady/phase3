import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const NavBar = () => {
    const { utilisateur, estConnecte, logout } = useAuth();
    const { toggleTheme, isDark } = useTheme();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navStyle = {
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
        padding: '12px 0',
        transition: 'background-color 0.3s ease',
    };

    const containerStyle = {
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    };

    const titleStyle = {
        fontSize: '20px',
        fontWeight: 'bold',
        color: isDark ? '#f3f4f6' : '#111827',
        margin: 0,
    };

    const linksWrapperStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
    };

    const linkStyle = {
        color: isDark ? '#d1d5db' : '#374151',
        textDecoration: 'none',
        fontSize: '16px',
        transition: 'color 0.2s',
    };

    const userNameStyle = {
        fontSize: '14px',
        color: isDark ? '#9ca3af' : '#4B5563',
        marginRight: '8px',
    };

    const btnLogoutStyle = {
        padding: '6px 16px',
        backgroundColor: isDark ? '#374151' : '#E5E7EB',
        color: isDark ? '#d1d5db' : '#374151',
        borderRadius: '6px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '14px',
        marginLeft: '8px',
        transition: 'background-color 0.2s',
    };

    const btnLoginStyle = {
        padding: '8px 18px',
        backgroundColor: '#3B82F6',
        color: '#ffffff',
        borderRadius: '6px',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: '500',
        marginLeft: '16px',
        transition: 'background-color 0.2s',
        whiteSpace: 'nowrap',
    };

    const btnRegisterStyle = {
        padding: '8px 18px',
        backgroundColor: 'transparent',
        color: isDark ? '#60a5fa' : '#3B82F6',
        border: isDark ? '1px solid #60a5fa' : '1px solid #3B82F6',
        borderRadius: '6px',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'background-color 0.2s',
        whiteSpace: 'nowrap',
    };

    const themeButtonStyle = {
        padding: '8px 12px',
        borderRadius: '6px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '18px',
        backgroundColor: isDark ? '#374151' : '#E5E7EB',
        transition: 'background-color 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '40px',
    };

    return (
        <nav style={navStyle}>
            <div style={containerStyle}>
                <h1 style={titleStyle}>🌆 Ambiance</h1>

                <div style={linksWrapperStyle}>
                    <Link 
                        to="/" 
                        style={linkStyle}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#3B82F6'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = isDark ? '#d1d5db' : '#374151'; }}
                    >
                        🏠 Accueil
                    </Link>

                    <Link 
                        to="/carte" 
                        style={linkStyle}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#3B82F6'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = isDark ? '#d1d5db' : '#374151'; }}
                    >
                        🗺️ Carte
                    </Link>

                    
                    <button
                        onClick={toggleTheme}
                        style={themeButtonStyle}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = isDark ? '#4B5563' : '#D1D5DB'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = isDark ? '#374151' : '#E5E7EB'; }}
                        aria-label="Changer le thème"
                        title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
                    >
                        {isDark ? '☀️' : '🌙'}
                    </button>

                    {estConnecte ? (
                        <>
                            <span style={userNameStyle}>👋 {utilisateur.nom}</span>
                            <button
                                onClick={handleLogout}
                                style={btnLogoutStyle}
                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = isDark ? '#4B5563' : '#D1D5DB'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = isDark ? '#374151' : '#E5E7EB'; }}
                            >
                                Déconnexion
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                style={btnLoginStyle}
                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#2563EB'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#3B82F6'; }}
                            >
                                Connexion
                            </Link>
                            <Link
                                to="/register"
                                style={btnRegisterStyle}
                                onMouseEnter={(e) => { 
                                    e.currentTarget.style.backgroundColor = isDark ? '#1e3a5f' : '#EFF6FF'; 
                                }}
                                onMouseLeave={(e) => { 
                                    e.currentTarget.style.backgroundColor = 'transparent'; 
                                }}
                            >
                                Inscription
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default NavBar;