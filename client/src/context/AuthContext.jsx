import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({
        token: localStorage.getItem('access_token'),
        role: localStorage.getItem('role')
    });

    const login = (token, role) => {
        localStorage.setItem('access_token', token);
        localStorage.setItem('role', role);
        console.log(role)
        setAuth({ token, role });
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('role');
        setAuth({ token: null, role: null });
    };

    return (
        <AuthContext.Provider value={{ auth, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
