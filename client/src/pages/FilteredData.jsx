import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BASE_URL = "http://localhost:8000/api";

function FilteredData() {
    const [users, setUsers] = useState([]);
    const [listings, setListings] = useState([]);
    const [cities, setCities] = useState([]);
    const [requests, setRequests] = useState([]);
    const token = localStorage.getItem("access_token");

    const [selectedSources, setSelectedSources] = useState({
        users: true,
        listings: true,
        cities: true,
        requests: true,
    });

    const [fieldFilters, setFieldFilters] = useState({
        users: { name: true, email: true, role: true, location: true },
        listings: { title: true, category: true, description: true, quantity: true, expiry_date: true, location: true },
        cities: { name: true, neighbors: true },
        requests: { requester_id: true, listing_id: true, notes: true, location: true, status: true },
    });

    const [showFieldFilters, setShowFieldFilters] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            if (selectedSources.users) {
                try {
                    const res = await axios.get(`${BASE_URL}/admin/users`, { headers: { Authorization: `Bearer ${token}` } });
                    setUsers(res.data);
                } catch (error) {
                    console.error("Error fetching users", error);
                }
            } else {
                setUsers([]);
            }
        };

        const fetchListings = async () => {
            if (selectedSources.listings) {
                try {
                    const res = await axios.get(`${BASE_URL}/admin/listings`, { headers: { Authorization: `Bearer ${token}` } });
                    setListings(res.data);
                } catch (error) {
                    console.error("Error fetching listings", error);
                }
            } else {
                setListaries([]);
            }
        };

        const fetchCities = async () => {
            if (selectedSources.cities) {
                try {
                    const res = await axios.get(`${BASE_URL}/cities`, { headers: { Authorization: `Bearer ${token}` } });
                    setCities(res.data);
                } catch (error) {
                    console.error("Error fetching cities", error);
                }
            } else {
                setCities([]);
            }
        };

        const fetchRequests = async () => {
            if (selectedSources.requests) {
                try {
                    const res = await axios.get(`${BASE_URL}/admin/requests`, { headers: { Authorization: `Bearer ${token}` } });
                    setRequests(res.data);
                } catch (error) {
                    console.error("Error fetching requests", error);
                }
            } else {
                setRequests([]);
            }
        };

        fetchUsers();
        fetchListings();
        fetchCities();
        fetchRequests();
    }, [selectedSources]);

    const handleCheckboxChange = (source) => {
        setSelectedSources(prevState => ({
            ...prevState,
            [source]: !prevState[source],
        }));
    };

    const handleFieldFilterChange = (source, field) => {
        setFieldFilters(prevState => ({
            ...prevState,
            [source]: {
                ...prevState[source],
                [field]: !prevState[source][field],
            },
        }));
    };

    const renderTable = (data, source, fields) => {
        if (!data || data.length === 0) return null;

        const visibleFields = Object.keys(fields).filter(field => fields[field]);

        return (
            <div className="mb-6 w-full bg-white/60 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/50 transform transition duration-300 hover:scale-101">
                <h3 className="font-bold text-xl text-gray-800 mb-4">{source}</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-gray-100">
                                {visibleFields.map(field => (
                                    <th key={field} className="py-3 px-4 text-left font-semibold text-gray-700">
                                        {field.charAt(0).toUpperCase() + field.slice(1)}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {source === "Cities (Neo4j)" ? (
                                data.map(city => (
                                    <tr key={city.name} className="hover:bg-gray-50">
                                        {visibleFields.map(field => (
                                            <td key={field} className="py-3 px-4 border-b text-gray-700">
                                                {field === "name" ? city.name : field === "neighbors" ? city.neighbors.join(", ") : ""}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                data.map(item => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        {visibleFields.map(field => (
                                            <td key={field} className="py-3 px-4 border-b text-gray-700">
                                                {item[field]}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-green-100 p-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 py-2">
                Global Data Dashboard
            </h2>

            <div className="flex flex-wrap justify-center gap-4 mb-6">
                <label className="flex items-center space-x-2 bg-white/60 backdrop-blur-lg rounded-full px-4 py-2 shadow-md border border-white/50 cursor-pointer">
                    <div className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${selectedSources.users ? 'bg-blue-600' : 'bg-gray-400'}`}>
                        <input
                            type="checkbox"
                            checked={selectedSources.users}
                            onChange={() => handleCheckboxChange('users')}
                            className="opacity-0 w-0 h-0"
                        />
                        <span className={`absolute top-0 left-0 w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 ${selectedSources.users ? 'translate-x-6' : 'translate-x-0'}`}></span>
                    </div>
                    <span className="text-gray-700">Users (MongoDB)</span>
                </label>

                <label className="flex items-center space-x-2 bg-white/60 backdrop-blur-lg rounded-full px-4 py-2 shadow-md border border-white/50 cursor-pointer">
                    <div className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${selectedSources.listings ? 'bg-blue-600' : 'bg-gray-400'}`}>
                        <input
                            type="checkbox"
                            checked={selectedSources.listings}
                            onChange={() => handleCheckboxChange('listings')}
                            className="opacity-0 w-0 h-0"
                        />
                        <span className={`absolute top-0 left-0 w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 ${selectedSources.listings ? 'translate-x-6' : 'translate-x-0'}`}></span>
                    </div>
                    <span className="text-gray-700">Listings (MongoDB)</span>
                </label>

                <label className="flex items-center space-x-2 bg-white/60 backdrop-blur-lg rounded-full px-4 py-2 shadow-md border border-white/50 cursor-pointer">
                    <div className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${selectedSources.cities ? 'bg-blue-600' : 'bg-gray-400'}`}>
                        <input
                            type="checkbox"
                            checked={selectedSources.cities}
                            onChange={() => handleCheckboxChange('cities')}
                            className="opacity-0 w-0 h-0"
                        />
                        <span className={`absolute top-0 left-0 w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 ${selectedSources.cities ? 'translate-x-6' : 'translate-x-0'}`}></span>
                    </div>
                    <span className="text-gray-700">Cities (Neo4j)</span>
                </label>

                <label className="flex items-center space-x-2 bg-white/60 backdrop-blur-lg rounded-full px-4 py-2 shadow-md border border-white/50 cursor-pointer">
                    <div className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${selectedSources.requests ? 'bg-blue-600' : 'bg-gray-400'}`}>
                        <input
                            type="checkbox"
                            checked={selectedSources.requests}
                            onChange={() => handleCheckboxChange('requests')}
                            className="opacity-0 w-0 h-0"
                        />
                        <span className={`absolute top-0 left-0 w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 ${selectedSources.requests ? 'translate-x-6' : 'translate-x-0'}`}></span>
                    </div>
                    <span className="text-gray-700">Requests (MongoDB)</span>
                </label>

                <button
                    onClick={() => setShowFieldFilters(!showFieldFilters)}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-full shadow-md border border-white/50"
                >
                    {showFieldFilters ? "Hide Fields" : "Show Fields"}
                </button>
            </div>

            {showFieldFilters && (
                <div className="flex flex-wrap justify-center gap-4 mb-6">
                    {Object.keys(fieldFilters).map(source => (
                        <div key={source} className="bg-white/60 backdrop-blur-lg rounded-lg p-4 shadow-md border border-white/50">
                            <h4 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
                                {source.charAt(0).toUpperCase() + source.slice(1)} Fields
                            </h4>
                            {Object.keys(fieldFilters[source]).map(field => (
                                <label key={field} className="flex items-center space-x-2 mb-2">
                                    <input
                                        type="checkbox"
                                        checked={fieldFilters[source][field]}
                                        onChange={() => handleFieldFilterChange(source, field)}
                                        className="form-checkbox h-5 w-5 text-blue-600"
                                    />
                                    <span className="text-gray-700">{field}</span>
                                </label>
                            ))}
                        </div>
                    ))}
                </div>
            )}

            {selectedSources.users && renderTable(users, "Users (MongoDB)", fieldFilters.users)}
            {selectedSources.listings && renderTable(listings, "Listings (MongoDB)", fieldFilters.listings)}
            {selectedSources.cities && renderTable(cities, "Cities (Neo4j)", fieldFilters.cities)}
            {selectedSources.requests && renderTable(requests, "Requests (MongoDB)", fieldFilters.requests)}
        </div>
    );
}

export default FilteredData;