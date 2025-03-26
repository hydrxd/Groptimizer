import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BASE_URL = "http://localhost:8000/api";

function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('consumer');
    const [location, setLocation] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${BASE_URL}/auth/register`, {
                name,
                email,
                password,
                role,
                location,
            });
            navigate('/login');
        } catch (err) {
            setError('Registration failed');
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-green-100">
            <div className="bg-white/30 backdrop-blur-lg p-8 rounded-2xl shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Create an Account</h2>
                {error && <div className="text-red-600 text-center mb-4">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Name</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 rounded-lg shadow-inner border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none transition"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full px-4 py-3 rounded-lg shadow-inner border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none transition"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Password</label>
                        <input
                            type="password"
                            className="w-full px-4 py-3 rounded-lg shadow-inner border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none transition"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Role</label>
                        <select
                            className="w-full px-4 py-3 rounded-lg shadow-inner border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none transition"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="consumer">Consumer</option>
                            <option value="supermarket">Supermarket</option>
                            <option value="food_bank">Food Bank</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Location</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 rounded-lg shadow-inner border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none transition"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            required
                        />
                    </div>
                    <button className="w-full bg-blue-600 text-white font-medium py-3 rounded-lg shadow-md hover:bg-blue-700 transition">
                        Register
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Register;
