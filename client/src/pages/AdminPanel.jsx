import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:8000/api";

function FormattedJson({ data }) {
    if (Array.isArray(data)) {
        return (
            <div>
                {data.map((item, index) => (
                    <div key={index} className="mb-4 p-4 bg-white/30 shadow-lg rounded-xl backdrop-blur-md">
                        <FormattedJson data={item} />
                    </div>
                ))}
            </div>
        );
    } else if (typeof data === "object" && data !== null) {
        return (
            <div>
                {Object.keys(data).map((key) => (
                    <div key={key} className="mb-2">
                        <span className="font-semibold text-gray-800">{key}:</span>{" "}
                        {typeof data[key] === "object" ? <FormattedJson data={data[key]} /> : data[key]}
                    </div>
                ))}
            </div>
        );
    } else {
        return <span>{data}</span>;
    }
}

function AdminPanel() {
    const [users, setUsers] = useState(null);
    const [listings, setListings] = useState(null);
    const [requests, setRequests] = useState(null);
    const [stats, setStats] = useState(null);
    const [error, setError] = useState("");
    const token = localStorage.getItem("access_token");

    const [cityName, setCityName] = useState("");
    const [cityMsg, setCityMsg] = useState("");
    const [cityError, setCityError] = useState("");

    const [cityA, setCityA] = useState("");
    const [cityB, setCityB] = useState("");
    const [neighborMsg, setNeighborMsg] = useState("");
    const [neighborError, setNeighborError] = useState("");

    const handleCreateCity = async (e) => {
        e.preventDefault();
        setCityError("");
        setCityMsg("");
        try {
            const res = await axios.post(
                `${BASE_URL}/cities`,
                { name: cityName },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCityMsg(res.data.msg);
            setCityName("");
        } catch (err) {
            setCityError(err.response?.data?.detail || "City creation failed");
        }
    };

    const handleCreateNeighbor = async (e) => {
        e.preventDefault();
        setNeighborError("");
        setNeighborMsg("");
        try {
            const res = await axios.post(
                `${BASE_URL}/cities/neighbors`,
                { city_a: cityA, city_b: cityB },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNeighborMsg(res.data.msg);
            setCityA("");
            setCityB("");
        } catch (err) {
            setNeighborError(err.response?.data?.detail || "Creating neighbor relationship failed");
        }
    };

    useEffect(() => {
        const fetchAdminData = async () => {
            if (!token) {
                setError("No token found. Please log in as an admin.");
                return;
            }
            try {
                const [usersRes, listingsRes, requestsRes, statsRes] = await Promise.all([
                    axios.get(`${BASE_URL}/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${BASE_URL}/admin/listings`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${BASE_URL}/admin/requests`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${BASE_URL}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
                ]);
                setUsers(usersRes.data);
                setListings(listingsRes.data);
                setRequests(requestsRes.data);
                setStats(statsRes.data);
            } catch (err) {
                console.error("Error fetching admin data", err);
                setError("Error fetching admin data.");
            }
        };

        fetchAdminData();
    }, [token]);

    if (error) {
        return <div className="p-4 text-red-600">{error}</div>;
    }

    return (
        <div className="p-6 bg-green-100/30 min-h-screen">

            <h2 className="text-3xl font-bold mb-6 text-gray-800">Admin Panel</h2>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Create City */}
                <section className="p-6 bg-white/60 shadow-lg rounded-xl backdrop-blur-md">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900">Create City</h2>
                    <form onSubmit={handleCreateCity}>
                        <input
                            type="text"
                            className="w-full p-3 rounded-lg border-none shadow-inner bg-white/40 backdrop-blur-lg text-gray-900"
                            placeholder="Enter City Name"
                            value={cityName}
                            onChange={(e) => setCityName(e.target.value)}
                            required
                        />
                        <button className="mt-4 w-full bg-blue-600 text-white p-3 rounded-lg shadow-md hover:bg-blue-700 transition">
                            Create City
                        </button>
                    </form>
                    {cityError && <div className="mt-4 text-red-600">{cityError}</div>}
                    {cityMsg && <div className="mt-4 text-green-600">{cityMsg}</div>}
                </section>

                {/* Create Neighbor */}
                <section className="p-6 bg-white/60 shadow-lg rounded-xl backdrop-blur-md">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900">Create Neighbor Relationship</h2>
                    <form onSubmit={handleCreateNeighbor}>
                        <input
                            type="text"
                            className="w-full p-3 mb-3 rounded-lg border-none shadow-inner bg-white/40 backdrop-blur-lg text-gray-900"
                            placeholder="City A"
                            value={cityA}
                            onChange={(e) => setCityA(e.target.value)}
                            required
                        />
                        <input
                            type="text"
                            className="w-full p-3 rounded-lg border-none shadow-inner bg-white/40 backdrop-blur-lg text-gray-900"
                            placeholder="City B"
                            value={cityB}
                            onChange={(e) => setCityB(e.target.value)}
                            required
                        />
                        <button className="mt-4 w-full bg-purple-600 text-white p-3 rounded-lg shadow-md hover:bg-purple-700 transition">
                            Create Neighbor Relationship
                        </button>
                    </form>
                    {neighborError && <div className="mt-4 text-red-600">{neighborError}</div>}
                    {neighborMsg && <div className="mt-4 text-green-600">{neighborMsg}</div>}
                </section>
            </div>

            {/* Data Sections */}
            {[["Users", users], ["Listings", listings], ["Requests", requests], ["Stats", stats]].map(
                ([title, data]) =>
                    data && (
                        <section key={title} className="mt-6 p-6 bg-white/60 shadow-lg rounded-xl backdrop-blur-md">
                            <h3 className="text-xl font-semibold mb-2 text-gray-900">{title}</h3>
                            <div className="bg-gray-100 p-4 rounded-lg">
                                <FormattedJson data={data} />
                            </div>
                        </section>
                    )
            )}
        </div>
    );
}

export default AdminPanel;
