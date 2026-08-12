import React, { createContext, useContext, useState, useEffect } from 'react';
const ThemeContext = createContext(null);
export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem('theme');
        return saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    });
    const [isAnimating, setIsAnimating] = useState(false);
    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
            root.style.colorScheme = 'dark';
        } else {
            root.classList.remove('dark');
            root.style.colorScheme = 'light';
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setIsAnimating(true);
        setTimeout(() => {
            setTheme(prev => prev === 'light' ? 'dark' : 'light');
            setTimeout(() => setIsAnimating(false), 300);
        }, 150);
    };

    const setLight = () => setTheme('light');
    const setDark = () => setTheme('dark');

    const value = {
        theme,
        isDark: theme === 'dark',
        isLight: theme === 'light',
        toggleTheme,
        setLight,
        setDark,
        isAnimating
    };
    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme doit être utilisé à l\'intérieur d\'un ThemeProvider');
    }
    return context;
};

export default ThemeContext;