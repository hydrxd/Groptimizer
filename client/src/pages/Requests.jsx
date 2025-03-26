import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const BASE_URL = "http://localhost:8000/api";

function Requests() {
    const [requests, setRequests] = useState([]);
    const [message, setMessage] = useState('');
    const { auth } = useContext(AuthContext);
    const token = localStorage.getItem('access_token');

    const fetchRequests = async () => {
        if (!token) return;
        try {
            const res = await axios.get(`${BASE_URL}/requests`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log(res.data);
            setRequests(res.data);
        } catch (error) {
            console.error("Error fetching requests", error);
        }
    };

    const handleUpdateRequest = async (requestId, status) => {
        try {
            await axios.put(`${BASE_URL}/requests/${requestId}`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage(`Request ${requestId} ${status}`);
            fetchRequests();
        } catch (error) {
            setMessage("Failed to update request");
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [token]);

    return (
        <div className="flex justify-center items-center min-h-screen bg-green-100/30">
            <div className="bg-white/30 backdrop-blur-lg p-8 rounded-2xl shadow-lg w-full max-w-2xl">
                <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Requests</h2>
                {message && <div className="text-center text-sm text-blue-700 mb-4">{message}</div>}

                <div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-4">Your Requests</h3>
                    {requests.length === 0 ? (
                        <p className="text-gray-500 text-center">No requests found.</p>
                    ) : (
                        requests.map((req) => (
                            <div key={req.request_id} className="bg-white/80 p-6 rounded-lg shadow-md mb-4">
                                <p className="text-gray-700"><strong>Request ID:</strong> {req.id}</p>
                                <p className="text-gray-700"><strong>Listing ID:</strong> {req.listing_id}</p>
                                <p className="text-gray-700"><strong>Location:</strong> {req.location}</p>
                                <p className="text-gray-700"><strong>Creation Date:</strong> {(() => new Date(req.created_at).toLocaleDateString('en-GB'))()}</p>
                                <p className="text-gray-700"><strong>Notes:</strong> {req.notes}</p>
                                <p className="text-gray-700"><strong>Status:</strong>
                                    <span className={`ml-2 px-3 py-1 rounded-full text-white text-sm 
                                        ${req.status === "pending" ? "bg-yellow-500" :
                                            req.status === "approved" ? "bg-green-500" : "bg-red-500"}`}>
                                        {req.status}
                                    </span>
                                </p>

                                {
                                    auth.role && (auth.role === "supermarket" || auth.role === "admin") && req.status === "pending" && (
                                        <div className="mt-4 flex gap-3">
                                            <button
                                                className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition"
                                                onClick={() => handleUpdateRequest(req.request_id, "approved")}
                                            >
                                                Approve
                                            </button>
                                            <button
                                                className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-700 transition"
                                                onClick={() => handleUpdateRequest(req.request_id, "declined")}
                                            >
                                                Decline
                                            </button>
                                        </div>
                                    )
                                }
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div >
    );
}

export default Requests;
