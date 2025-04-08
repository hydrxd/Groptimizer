import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Listings from './pages/Listings';
import CreateListing from './pages/CreateListing';
import Requests from './pages/Requests';
import CreateRequest from './pages/CreateRequest';
import AdminPanel from './pages/AdminPanel';
import MatchingAndNeo4j from './pages/MatchingAndNeo4j';
import FilteredData from './pages/FilteredData';

function App() {
    return (
        <div className="flex h-screen">
            {/* Sidebar (Navbar) */}
            <div className="w-64 bg-gray-800 text-white">
                <Navbar />
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/listings" element={<Listings />} />
                    <Route path="/create-listing" element={<CreateListing />} />
                    <Route path="/requests" element={<Requests />} />
                    <Route path="/create-request" element={<CreateRequest />} />
                    <Route path="/admin" element={<AdminPanel />} />
                    <Route path="/matching-neo4j" element={<MatchingAndNeo4j />} />
                    <Route path="/dashboard" element={<FilteredData />} />
                </Routes>
            </div>
        </div>
    );
}

export default App;
