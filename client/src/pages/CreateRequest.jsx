import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = "http://localhost:8000/api";

function CreateRequest({ fetchRequests }) {
    const [listingId, setListingId] = useState('');
    const [notes, setNotes] = useState('');
    const [message, setMessage] = useState('');
    const [listingDetails, setListingDetails] = useState(null);
    const [loadingListing, setLoadingListing] = useState(false);
    const [listingError, setListingError] = useState('');

    const token = localStorage.getItem('access_token');

    // Fetch listing details when listingId changes
    useEffect(() => {
        if (!listingId) {
            setListingDetails(null);
            setListingError('');
            return;
        }

        const fetchListingDetails = async () => {
            setLoadingListing(true);
            setListingError('');
            try {
                const res = await axios.get(`${BASE_URL}/listings/${listingId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setListingDetails(res.data);
            } catch (err) {
                setListingDetails(null);
                setListingError('Listing not found');
            } finally {
                setLoadingListing(false);
            }
        };

        fetchListingDetails();
    }, [listingId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) {
            setMessage("You must be logged in to create a request");
            return;
        }
        if (!listingDetails) {
            setMessage("Please enter a valid Listing ID.");
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
            setListingDetails(null);
            setListingError('');
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

                    {loadingListing ? (
                        <p className="text-sm text-gray-500">Fetching listing details...</p>
                    ) : listingDetails ? (
                        <div className="p-2 bg-gray-100 rounded-md text-sm text-gray-700 mb-2">
                            <p><strong>Title:</strong> {listingDetails.title}</p>
                            <p><strong>Category:</strong> {listingDetails.category}</p>
                            <p><strong>Quantity:</strong> {listingDetails.quantity}</p>
                            <p><strong>Expiry:</strong> {new Date(listingDetails.expiry_date).toLocaleDateString()}</p>
                            <p><strong>Location:</strong> {listingDetails.location}</p>
                        </div>
                    ) : (
                        listingId && listingError && <p className="text-sm text-red-500">{listingError}</p>
                    )}

                    <div className="relative">
                        <textarea
                            placeholder="Notes"
                            className="w-full bg-white/50 px-4 py-3 rounded-xl shadow-inner focus:ring-2 focus:ring-blue-400 transition resize-none"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        ></textarea>
                    </div>

                    <button
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold px-4 py-3 rounded-xl shadow-md hover:shadow-lg transition duration-300 transform hover:scale-105"
                        type="submit"
                        disabled={loadingListing || !listingDetails}
                    >
                        {loadingListing ? "Fetching..." : "Create Request"}
                    </button>
                    {!listingDetails && listingId && !loadingListing && (
                        <p className="text-xs text-gray-600 mt-1">Please ensure the Listing ID is correct before submitting.</p>
                    )}
                </form>
            </div>
        </div>
    );
}

export default CreateRequest;