import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Home, List, PlusCircle, Clipboard, LogOut, Users, HeartHandshake } from "lucide-react";
import logo from "../assets/groptimizer-logo.png"; // Import the logo

const Navbar = () => {
    const { auth, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const renderLinks = () => {
        const links = [];

        if (!auth.token) {
            links.push(
                { name: "Home", to: "/", icon: <Home size={20} className="text-gray-300" /> },
                { name: "Login", to: "/login", icon: <Users size={20} className="text-gray-300" /> },
                { name: "Register", to: "/register", icon: <Users size={20} className="text-gray-300" /> },
                { name: "Listings", to: "/listings", icon: <List size={20} className="text-gray-300" /> }
            );
        } else {
            links.push({ name: "Home", to: "/", icon: <Home size={20} className="text-gray-300" /> });

            if (auth.role) {
                links.push({ name: "Listings", to: "/listings", icon: <List size={20} className="text-gray-300" /> });

                switch (auth.role) {
                    case "supermarket":
                        links.push(
                            { name: "Create Listing", to: "/create-listing", icon: <PlusCircle size={20} className="text-gray-300" /> },
                            { name: "Requests", to: "/requests", icon: <Clipboard size={20} className="text-gray-300" /> }
                        );
                        break;
                    case "food_bank":
                        links.push(
                            { name: "Requests", to: "/requests", icon: <Clipboard size={20} className="text-gray-300" /> },
                            { name: "Create Request", to: "/create-request", icon: <PlusCircle size={20} className="text-gray-300" /> },
                            { name: "Matching", to: "/matching-neo4j", icon: <HeartHandshake size={20} className="text-gray-300" /> }
                        );
                        break;
                    case "consumer":
                        links.push(
                            { name: "Requests", to: "/requests", icon: <Clipboard size={20} className="text-gray-300" /> },
                            { name: "Create Request", to: "/create-request", icon: <PlusCircle size={20} className="text-gray-300" /> }
                        );
                        break;
                    case "admin":
                        links.push(
                            { name: "Create Listing", to: "/create-listing", icon: <PlusCircle size={20} className="text-gray-300" /> },
                            { name: "Requests", to: "/requests", icon: <Clipboard size={20} className="text-gray-300" /> },
                            { name: "Admin Panel", to: "/admin", icon: <Users size={20} className="text-gray-300" /> },
                            { name: "Matching", to: "/matching-neo4j", icon: <HeartHandshake size={20} className="text-gray-300" /> }
                        );
                        break;
                    default:
                        break;
                }
            }
        }

        return links;
    };

    return (
        <div className="h-screen w-64 fixed left-0 top-0 bg-gray-900/40 backdrop-blur-lg shadow-xl border-r border-gray-800 flex flex-col p-6 space-y-6 text-gray-300">
            {/* Logo and App Name */}
            <div className="flex items-center space-x-3">
                <img src={logo} alt="Groptimizer Logo" className="w-10 h-10" />
                <h2 className="text-xl font-semibold tracking-wide text-white bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    Groptimizer
                </h2>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 space-y-3">
                {renderLinks().map((link, index) => (
                    <Link
                        key={index}
                        to={link.to}
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 
                        bg-gray-800/30 hover:bg-gray-700/50 shadow-md hover:shadow-lg
                        border border-gray-700/50 hover:border-gray-600"
                    >
                        {link.icon}
                        <span className="text-gray-200">{link.name}</span>
                    </Link>
                ))}
            </nav>

            {/* Logout Button */}
            {auth.token && (
                <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 
                    bg-red-500/20 hover:bg-red-500/40 text-white shadow-md hover:shadow-lg
                    border border-red-500/50 hover:border-red-400"
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            )}
        </div>
    );
};

export default Navbar;