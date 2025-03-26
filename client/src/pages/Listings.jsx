import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BASE_URL = "http://localhost:8000/api";

function Listings() {
    const [listings, setListings] = useState([]);

    useEffect(() => {
        const fetchListings = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/listings`);
                setListings(res.data);
            } catch (error) {
                console.error("Error fetching listings", error);
            }
        };
        fetchListings();
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-green-100 p-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 py-2">
                Available Listings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
                {listings.length > 0 ? (
                    listings.map((listing) => (
                        <div
                            key={listing.listing_id}
                            className="bg-white/60 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/50 transform transition duration-300 hover:scale-105"
                        >
                            <h3 className="font-bold text-xl text-gray-800">{listing.title}</h3>
                            <p className="text-gray-600">{listing.description}</p>
                            <div className="mt-3 text-sm text-gray-700">
                                <p><strong>Listing ID:</strong> {listing.id}</p>
                                <p><strong>Location:</strong> {listing.location}</p>
                                <p><strong>Category:</strong> {listing.category}</p>
                                <p><strong>Quantity:</strong> {listing.quantity}</p>
                                <p><strong>Expires:</strong> {new Date(listing.expiry_date).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-600">No listings available.</p>
                )}
            </div>
        </div>
    );
}

export default Listings;
