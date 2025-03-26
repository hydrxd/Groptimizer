import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; // Adjust path as needed

const BASE_URL = "http://localhost:8000/api";

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const params = new URLSearchParams();
            params.append('username', email);
            params.append('password', password);
            params.append('grant_type', 'password');

            const response = await axios.post(`${BASE_URL}/auth/login`, params, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            const { access_token, role } = response.data;
            login(access_token, role);
            navigate('/listings');
        } catch (err) {
            console.error(err);
            setError('Invalid email or password');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-green-100 p-6">
            <div className="bg-white/70 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/50 w-full max-w-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    Welcome Back 👋
                </h2>
                {error && <div className="text-red-600 mb-4 text-center">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block font-semibold text-gray-700 mb-1">Email:</label>
                        <input
                            type="email"
                            className="w-full border border-gray-300 px-4 py-2 rounded-lg shadow-inner focus:ring focus:ring-purple-400 transition"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block font-semibold text-gray-700 mb-1">Password:</label>
                        <input
                            type="password"
                            className="w-full border border-gray-300 px-4 py-2 rounded-lg shadow-inner focus:ring focus:ring-purple-400 transition"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg shadow-lg transform transition hover:scale-105"
                        type="submit"
                    >
                        Login
                    </button>
                </form>
                <p className="mt-4 text-gray-600 text-sm text-center">
                    Don't have an account? <a href="/register" className="text-purple-600 font-semibold">Sign Up</a>
                </p>
            </div>
        </div>
    );
}

export default Login;
