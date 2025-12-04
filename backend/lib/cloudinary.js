import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Muat variabel lingkungan dari file .env
dotenv.config();

// Validasi konfigurasi Cloudinary
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error('❌ Cloudinary configuration missing!');
  console.error('Required environment variables:');
  console.error('- CLOUDINARY_CLOUD_NAME:', cloudName ? '✅ Set' : '❌ Missing');
  console.error('- CLOUDINARY_API_KEY:', apiKey ? '✅ Set' : '❌ Missing');
  console.error('- CLOUDINARY_API_SECRET:', apiSecret ? '✅ Set' : '❌ Missing');
  throw new Error('Cloudinary configuration is incomplete. Please check your .env file.');
}

// Konfigurasi Cloudinary menggunakan variabel lingkungan
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true, // Pastikan URL yang dihasilkan selalu HTTPS
});

console.log('✅ Cloudinary configured successfully');

// Ekspor instance cloudinary yang sudah dikonfigurasi sebagai default
export default cloudinary;
