import React from "react";

function Home() {
    // Replace this with actual authentication state logic
    const isLoggedIn = localStorage.getItem("access_token") !== null;

    return (
        <div className="home-container bg-gradient-to-br from-green-100 to-green-200">
            {/* Hero Section */}
            <div className="hero-container section-container bg-white shadow-lg rounded-xl py-16 px-8 mx-4 my-6">
                <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center">
                    {/* Content */}
                    <div className="lg:w-1/2 text-center lg:text-left">
                        <h1 className="text-4xl font-extrabold text-gray-800 drop-shadow-md">What Is Groptimizer?</h1>
                        <p className="text-lg text-gray-600 mt-4">
                            Groptimizer is a community-driven initiative optimizing grocery resources by redistributing
                            surplus food to food banks, homeless shelters, and individuals in need.
                        </p>
                        {!isLoggedIn && (
                            <div className="mt-6 flex justify-center lg:justify-start space-x-4">
                                <a href="/register" className="px-6 py-3 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 transition-all">
                                    Register
                                </a>
                                <a href="/login" className="px-6 py-3 border border-blue-500 text-blue-600 rounded-full hover:bg-blue-100 transition-all">
                                    Log in
                                </a>
                            </div>
                        )}
                    </div>
                    {/* Image */}
                    <div className="lg:w-1/2 mt-6 lg:mt-0">
                        <img
                            src="https://images.unsplash.com/photo-1526470498-9ae73c665de8?ixlib=rb-4.0.3&w=600"
                            alt="Grocery"
                            className="rounded-lg shadow-lg w-full"
                        />
                    </div>
                </div>
            </div>

            {/* About Section */}
            <div className="section-container bg-white shadow-lg rounded-xl py-16 px-8 mx-4 my-6">
                <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center">
                    {/* Left - Image Section */}
                    <div className="w-full md:w-1/2">
                        <img
                            src="https://images.unsplash.com/photo-1604881991720-f91add269bed?ixlib=rb-4.0.3&w=1200"
                            alt="Holding Hands"
                            className="w-full h-[300px] md:h-[400px] object-cover rounded-lg"
                        />
                    </div>

                    {/* Right - Text Section */}
                    <div className="w-full md:w-1/2 flex flex-col justify-center p-6">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                            About Us
                        </h2>
                        <p className="text-gray-600 mt-4 leading-relaxed">
                            Led by passionate students from PSG College of Technology,
                            Groptimizer aims to reduce food waste by redirecting surplus food to
                            those in need.
                        </p>
                        <button className="mt-6 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition">
                            Learn more
                        </button>
                    </div>
                </div>
            </div>

            {/* Mission Section */}
            <div className="section-container bg-white shadow-lg rounded-xl py-16 px-8 mx-4 my-6">
                <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center">
                    {/* Content */}
                    <div className="lg:w-1/2 text-center lg:text-left">
                        <h2 className="text-3xl font-extrabold text-gray-800 drop-shadow-md">Our Mission</h2>
                        <p className="text-lg text-gray-600 mt-4">
                            Reducing food waste and alleviating hunger by collecting and redistributing nearly expired
                            food to food banks and shelters.
                        </p>
                        <div className="mt-6">
                            <button className="px-6 py-3 bg-gray-700 text-white rounded-full shadow-md hover:bg-gray-800 transition-all">
                                See how
                            </button>
                        </div>
                    </div>
                    {/* Image */}
                    <div className="lg:w-1/2 mt-6 lg:mt-0">
                        <img
                            src="https://images.unsplash.com/photo-1695653423053-64e76a128f1c?ixlib=rb-4.0.3&w=1200"
                            alt="Groceries"
                            className="rounded-lg shadow-lg w-full"
                        />
                    </div>
                </div>
            </div>

            {/* Contact Us Section */}
            <div className="bg-blue-600 text-white py-16 px-8 rounded-xl mx-4 my-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-extrabold drop-shadow-md">Contact Us</h2>
                    <p className="text-lg mt-4">Reach Out To Us At</p>
                    <p className="text-xl font-semibold mt-2">reachout@groptimizer.com</p>
                    <p className="text-lg mt-2">+91 999-000-9999</p>
                    <p className="text-lg mt-6">Meet Us At</p>
                    <p className="text-lg">PSG College Of Technology</p>
                    <p className="text-lg">Peelamedu, Coimbatore - 004</p>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-8 px-8 rounded-xl mx-4 my-6 shadow-md">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between">
                    {/* Column 1 */}
                    <div>
                        <h3 className="text-lg font-semibold">App</h3>
                        <p className="text-sm mt-2">Log in to Portal</p>
                        <p className="text-sm">Administrative</p>
                    </div>
                    {/* Column 2 */}
                    <div>
                        <h3 className="text-lg font-semibold">Organization</h3>
                        <p className="text-sm mt-2"><a href="#about-us" className="hover:underline">About</a></p>
                        <p className="text-sm">Code of Conduct</p>
                        <p className="text-sm"><a href="#contact-us" className="hover:underline">Contact Us</a></p>
                    </div>
                    {/* Column 3 */}
                    <div>
                        <h3 className="text-lg font-semibold">Follow</h3>
                        <p className="text-sm mt-2 hover:underline">Instagram</p>
                        <p className="text-sm hover:underline">Twitter</p>
                        <p className="text-sm hover:underline">Facebook</p>
                        <p className="text-sm hover:underline">LinkedIn</p>
                        <p className="text-sm hover:underline">YouTube</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Home;
