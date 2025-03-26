import React, { useState } from 'react';
import axios from 'axios';

const BASE_URL = "http://localhost:8000/api";

function CreateRequest({ fetchRequests }) {
    const [listingId, setListingId] = useState('');
    const [notes, setNotes] = useState('');
    const [message, setMessage] = useState('');
    const [location, setLocation] = useState('');

    const token = localStorage.getItem('access_token');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) {
            setMessage("You must be logged in to create a request");
            return;
        }
        try {
            await axios.post(`${BASE_URL}/requests`, {
                listing_id: listingId,
                notes,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage("Request created!");
            setListingId('');
            setNotes('');
            setLocation('');
            fetchRequests();
        } catch (error) {
            setMessage("Failed to create request");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-green-100">
            <div className="backdrop-blur-lg bg-white/40 shadow-lg rounded-3xl p-6 max-w-lg w-full border border-white/50">
                <h3 className="text-2xl font-bold text-gray-800 text-center mb-6">Create Request</h3>

                {message && (
                    <div className={`text-center p-2 rounded mb-4 ${message.includes("Failed") ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Listing ID"
                            className="w-full bg-white/50 px-4 py-3 rounded-xl shadow-inner focus:ring-2 focus:ring-blue-400 transition"
                            value={listingId}
                            onChange={(e) => setListingId(e.target.value)}
                            required
                        />
                    </div>

                    <div className="relative">
                        <textarea
                            placeholder="Notes"
                            className="w-full bg-white/50 px-4 py-3 rounded-xl shadow-inner focus:ring-2 focus:ring-blue-400 transition resize-none"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        ></textarea>
                    </div>

                    <button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold px-4 py-3 rounded-xl shadow-md hover:shadow-lg transition duration-300 transform hover:scale-105">
                        Create Request
                    </button>
                </form>
            </div>
        </div>
    );
}

export default CreateRequest;
