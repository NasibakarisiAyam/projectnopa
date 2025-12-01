import React from 'react';

const Homepage = () => {
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col items-center justify-center p-6">
            <h1 className="text-4xl font-bold mb-4 text-gray-900">Welcome to BookRuangan</h1>
            <div className="mt-6">
                <a href="/book" className="inline-block bg-pink-600 text-white px-6 py-3 rounded-md shadow">Pesan Sekarang</a>
            </div>
        </div>
    );
};

export default Homepage;
