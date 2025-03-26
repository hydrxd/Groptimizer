import React, { useState } from 'react';
import axios from 'axios';

const BASE_URL = "http://localhost:8000/api";

function CreateListing() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [expiryDays, setExpiryDays] = useState(7);
    const [location, setLocation] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('access_token');
        if (!token) {
            setError('You must be logged in to create a listing');
            return;
        }
        try {
            await axios.post(`${BASE_URL}/listings`, {
                title,
                description,
                category,
                quantity,
                expiry_date: new Date(Date.now() + expiryDays * 86400000).toISOString(),
                location,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccess("Listing created successfully!");
            setError('');
            setTitle('');
            setDescription('');
            setCategory('');
            setQuantity(1);
            setExpiryDays(7);
            setLocation('');
        } catch (err) {
            setError('Failed to create listing');
            setSuccess('');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-green-100">
            <div className="backdrop-blur-lg bg-white/40 shadow-lg rounded-3xl p-6 max-w-lg w-full border border-white/50">
                <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Create Listing</h2>

                {error && <div className="text-red-600 text-center bg-red-100 p-2 rounded mb-4">{error}</div>}
                {success && <div className="text-green-600 text-center bg-green-100 p-2 rounded mb-4">{success}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Title"
                            className="w-full bg-white/50 px-4 py-3 rounded-xl shadow-inner focus:ring-2 focus:ring-blue-400 transition"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="relative">
                        <textarea
                            placeholder="Description"
                            className="w-full bg-white/50 px-4 py-3 rounded-xl shadow-inner focus:ring-2 focus:ring-blue-400 transition resize-none"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        ></textarea>
                    </div>

                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Category"
                            className="w-full bg-white/50 px-4 py-3 rounded-xl shadow-inner focus:ring-2 focus:ring-blue-400 transition"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <input
                                type="number"
                                placeholder="Quantity"
                                className="w-full bg-white/50 px-4 py-3 rounded-xl shadow-inner focus:ring-2 focus:ring-blue-400 transition"
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                required
                            />
                        </div>

                        <div className="relative">
                            <input
                                type="number"
                                placeholder="Expiry Days"
                                className="w-full bg-white/50 px-4 py-3 rounded-xl shadow-inner focus:ring-2 focus:ring-blue-400 transition"
                                value={expiryDays}
                                onChange={(e) => setExpiryDays(Number(e.target.value))}
                                required
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Location"
                            className="w-full bg-white/50 px-4 py-3 rounded-xl shadow-inner focus:ring-2 focus:ring-blue-400 transition"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            required
                        />
                    </div>

                    <button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold px-4 py-3 rounded-xl shadow-md hover:shadow-lg transition duration-300 transform hover:scale-105">
                        Create Listing
                    </button>
                </form>
            </div>
        </div>
    );
}

export default CreateListing;
