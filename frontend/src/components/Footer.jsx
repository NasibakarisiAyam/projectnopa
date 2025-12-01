import React from 'react';

const Footer = () => {
    return (
        <footer className="mt-12 py-10 bg-gradient-to-tr from-gray-900 to-gray-800 text-white">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                    <h4 className="font-bold mb-3">eRoom</h4>
                    <p className="text-sm text-gray-300">Sistem pemesanan ruangan terintegrasi yang memudahkan Anda dalam mengelola jadwal dan booking ruangan.</p>
                </div>
                <div>
                    <h5 className="font-semibold mb-2">Quick Links</h5>
                    <ul className="text-sm text-gray-300 space-y-1">
                        <li>Pengaturan</li>
                        <li>Jadwal Saya</li>
                        <li>Pesan Ruangan</li>
                        <li>Logout</li>
                    </ul>
                </div>
                <div>
                    <h5 className="font-semibold mb-2">Navigasi</h5>
                    <ul className="text-sm text-gray-300 space-y-1">
                        <li>Beranda</li>
                        <li>Dashboard</li>
                        <li>Panduan</li>
                        <li>Kontak</li>
                    </ul>
                </div>
                <div>
                    <h5 className="font-semibold mb-2">Kontak Kami</h5>
                    <div className="text-sm text-gray-300">
                        <div>info@eroom.local</div>
                        <div>+62 21 1234 5678</div>
                        <div>Jakarta, Indonesia</div>
                    </div>
                </div>
            </div>
            <div className="mt-8 text-center text-gray-400 text-sm">© {new Date().getFullYear()} eRoom — All rights reserved</div>
        </footer>
    );
};

export default Footer;
