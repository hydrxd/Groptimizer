import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const BASE_URL = "http://localhost:8000/api";

function MatchingAndNeo4j() {
    const [listingId, setListingId] = useState('');
    const [listingDetails, setListingDetails] = useState(null);
    const [matchingResponse, setMatchingResponse] = useState(null);
    const [matchingError, setMatchingError] = useState('');
    const [loadingListing, setLoadingListing] = useState(false);

    const token = localStorage.getItem('access_token');

    // Fetch listing details when listingId changes
    useEffect(() => {
        if (!listingId) {
            setListingDetails(null);
            return;
        }

        const fetchListingDetails = async () => {
            setLoadingListing(true);
            try {
                const res = await axios.get(`${BASE_URL}/listings/${listingId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setListingDetails(res.data);
            } catch (err) {
                setListingDetails(null);
            } finally {
                setLoadingListing(false);
            }
        };

        fetchListingDetails();
    }, [listingId]);

    const handleMatchingSubmit = async (e) => {
        e.preventDefault();
        setMatchingError('');
        setMatchingResponse(null);
        try {
            const res = await axios.post(
                `${BASE_URL}/matching`,
                { listing_id: listingId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMatchingResponse(res.data);
        } catch (err) {
            setMatchingError(err.response?.data?.detail || "Matching request failed");
        }
    };

    const renderMatchingResult = () => {
        let content = matchingResponse.matches_llm_output;
        if (content.startsWith("```json")) {
            content = content.replace("```json", "").trim();
        }
        if (content.endsWith("```")) {
            content = content.substring(0, content.lastIndexOf("```")).trim();
        }
        try {
            const parsed = JSON.parse(content);
            if (Array.isArray(parsed)) {
                return parsed.map((item, idx) => (
                    <div key={idx} className="mb-4 p-3 bg-white/50 backdrop-blur-lg rounded-lg shadow-md">
                        <p><strong>Inventory Item ID:</strong> {item.inventory_item_id}</p>
                        <p><strong>Recommended Food Bank ID:</strong> {item.recommended_food_bank_id}</p>
                        <p><strong>Explanation:</strong> {item.explanation}</p>
                    </div>
                ));
            } else if (typeof parsed === 'object' && parsed !== null) {
                return (
                    <div className="mb-4 p-3 bg-white/50 backdrop-blur-lg rounded-lg shadow-md">
                        <p><strong>Inventory Item ID:</strong> {parsed.inventory_item_id}</p>
                        <p><strong>Recommended Food Bank ID:</strong> {parsed.recommended_food_bank_id}</p>
                        <p><strong>Explanation:</strong> {parsed.explanation}</p>
                    </div>
                );
            } else {
                return <div>{content}</div>;
            }
        } catch (e) {
            return <ReactMarkdown>{content}</ReactMarkdown>;
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-green-100 p-6">
            <div className="bg-white/70 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/50 w-full max-w-5xl">
                <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">🔗 Matching</h1>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">Generate Matching Suggestions</h2>
                    <p className="mb-4 text-sm text-gray-600">
                        <strong>(Supermarkets only)</strong>: Enter a listing ID to find matches.
                    </p>
                    <form onSubmit={handleMatchingSubmit} className="space-y-4">
                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">Listing ID:</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 px-4 py-2 rounded-lg shadow-inner focus:ring focus:ring-purple-400 transition"
                                value={listingId}
                                onChange={(e) => setListingId(e.target.value)}
                                required
                            />
                        </div>

                        {/* Show listing details dynamically */}
                        {loadingListing ? (
                            <p className="text-sm text-gray-500">Fetching listing details...</p>
                        ) : listingDetails ? (
                            <div className="p-4 bg-gray-100 rounded-lg shadow">
                                <h3 className="font-bold mb-2">Listing Details:</h3>
                                <p><strong>Title:</strong> {listingDetails.title}</p>
                                <p><strong>Description:</strong> {listingDetails.description}</p>
                                <p><strong>Category:</strong> {listingDetails.category}</p>
                                <p><strong>Quantity:</strong> {listingDetails.quantity}</p>
                                <p><strong>Expiry Date:</strong> {new Date(listingDetails.expiry_date).toLocaleDateString()}</p>
                                <p><strong>Location:</strong> {listingDetails.location}</p>
                            </div>
                        ) : (
                            listingId && <p className="text-sm text-red-500">Listing not found</p>
                        )}

                        <button
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg shadow-lg transform transition hover:scale-105"
                            type="submit"
                        >
                            Get Matching Suggestions
                        </button>
                    </form>
                    {matchingError && <div className="mt-4 text-red-600 text-center">{matchingError}</div>}
                </section>

                {matchingResponse && (
                    <div className="mt-6 p-4 bg-gray-100 rounded-lg shadow">
                        <h3 className="font-bold mb-2">Matching Result:</h3>
                        {renderMatchingResult()}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MatchingAndNeo4j;
