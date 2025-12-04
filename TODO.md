# Setup Project for Railway Deployment

## Tasks
- [x] Update package.json scripts for Railway deployment
- [x] Modify server.js to serve static files from frontend build
- [x] Update CORS configuration for production
- [x] Update build script to properly build frontend
- [x] Ensure environment variables are documented for Railway

## Environment Variables Required for Railway Deployment
Set these in your Railway project environment variables:

- `MONGO_URI`: MongoDB connection string (e.g., mongodb+srv://...)
- `JWT_SECRET`: Secret key for JWT token signing (generate a secure random string)
- `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Your Cloudinary API key
- `CLOUDINARY_API_SECRET`: Your Cloudinary API secret
- `PORT`: Port for the server (optional, defaults to 5000)

## Deployment Steps
1. Push this code to GitHub
2. Connect your GitHub repo to Railway
3. Set the environment variables in Railway dashboard
4. Deploy!
