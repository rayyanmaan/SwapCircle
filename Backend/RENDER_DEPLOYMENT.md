# Deploying SwapCircle Backend on Render

This guide explains how to deploy the SwapCircle backend Docker image on Render.

## Option 1: Deploy from Docker Registry (Recommended)

### Step 1: Push Image to Docker Hub

1. **Create a Docker Hub account** (if you don't have one): https://hub.docker.com

2. **Login to Docker Hub:**
   ```bash
   docker login
   ```

3. **Build and tag your image:**
   ```bash
   cd Backend
   docker build -t your-dockerhub-username/swapcircle-backend:latest .
   ```

4. **Push the image:**
   ```bash
   docker push your-dockerhub-username/swapcircle-backend:latest
   ```

### Step 2: Deploy on Render

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click "New +" → "Web Service"**
3. **Select "Deploy an existing image from a registry"**
4. **Enter your image URL:**
   ```
   docker.io/your-dockerhub-username/swapcircle-backend:latest
   ```
5. **Configure the service:**
   - **Name**: `swapcircle-backend` (or your preferred name)
   - **Region**: Choose closest to your users
   - **Branch**: (not applicable for Docker images)
   - **Instance Type**: Choose based on your needs (Free tier available)

6. **Environment Variables** - Add these in Render dashboard:
   ```
   MONGODB_URI=mongodb+srv://naqvi:MGCj34TSjAztZPwo@cluster0.tttcfhu.mongodb.net/
   DATABASE_NAME=Cluster0
   SECRET_KEY=your-production-secret-key-here
   JWT_SECRET_KEY=your-production-secret-key-here
   FIREBASE_STORAGE_BUCKET=pics-storage-37f99.firebasestorage.app
   FIREBASE_CREDENTIALS_PATH=/app/pics-storage-37f99-firebase-adminsdk-fbsvc-96dca777fc.json
   CORS_ORIGINS=https://your-frontend-domain.com,http://localhost:3000
   ```

7. **Firebase Credentials** - You have two options:
   
   **Option A: Base64 Encode and Store as Environment Variable**
   ```bash
   # On your local machine
   base64 -i pics-storage-37f99-firebase-adminsdk-fbsvc-96dca777fc.json
   ```
   Then in Render, add:
   ```
   FIREBASE_CREDENTIALS_BASE64=<paste-base64-encoded-content>
   ```
   And update your Dockerfile to decode it (see Option B below).

   **Option B: Use Render's Secret Files** (Recommended)
   - In Render dashboard, go to your service → "Environment"
   - Use "Secret Files" section to upload the Firebase credentials JSON
   - Render will mount it as a file

8. **Health Check Path**: `/` (Render will check this automatically)

9. **Click "Create Web Service"**

## Option 2: Deploy from GitHub (Build on Render)

If your code is on GitHub, Render can build the Docker image automatically:

1. **Go to Render Dashboard** → "New +" → "Web Service"
2. **Connect your GitHub repository**
3. **Configure:**
   - **Name**: `swapcircle-backend`
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `Backend`
   - **Environment**: `Docker`
   - **Dockerfile Path**: `Backend/Dockerfile` (or just `Dockerfile` if root is Backend)
   - **Docker Context**: `Backend`

4. **Environment Variables** - Same as Option 1, Step 6

5. **Firebase Credentials** - Upload via Secret Files in Render dashboard

6. **Click "Create Web Service"**

## Option 3: Using GitHub Container Registry (GHCR)

If you prefer GitHub Container Registry over Docker Hub:

### Step 1: Push to GHCR

1. **Create a GitHub Personal Access Token** with `write:packages` permission

2. **Login to GHCR:**
   ```bash
   echo $GITHUB_TOKEN | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
   ```

3. **Build and tag:**
   ```bash
   cd Backend
   docker build -t ghcr.io/YOUR_GITHUB_USERNAME/swapcircle-backend:latest .
   ```

4. **Push:**
   ```bash
   docker push ghcr.io/YOUR_GITHUB_USERNAME/swapcircle-backend:latest
   ```

### Step 2: Deploy on Render

Use the same steps as Option 1, but use:
```
ghcr.io/YOUR_GITHUB_USERNAME/swapcircle-backend:latest
```

**Note**: Make sure the package is public, or configure Render with credentials to access private packages.

## Environment Variables for Render

Set these in Render's Environment Variables section:

| Variable | Value | Required |
|----------|-------|----------|
| `MONGODB_URI` | Your MongoDB Atlas connection string | Yes |
| `DATABASE_NAME` | Your database name (e.g., `Cluster0`) | Yes |
| `SECRET_KEY` | Strong secret key for JWT tokens | Yes |
| `JWT_SECRET_KEY` | Same as SECRET_KEY (for compatibility) | Yes |
| `FIREBASE_STORAGE_BUCKET` | Your Firebase storage bucket | Yes |
| `FIREBASE_CREDENTIALS_PATH` | `/app/pics-storage-37f99-firebase-adminsdk-fbsvc-96dca777fc.json` | Yes |
| `CORS_ORIGINS` | Comma-separated list of allowed origins | Yes |

## Firebase Credentials Setup

### Method 1: Secret Files (Recommended)

1. In Render dashboard → Your Service → "Environment"
2. Scroll to "Secret Files"
3. Click "Add Secret File"
4. **Name**: `pics-storage-37f99-firebase-adminsdk-fbsvc-96dca777fc.json`
5. **Contents**: Paste your Firebase credentials JSON
6. The file will be available at `/app/pics-storage-37f99-firebase-adminsdk-fbsvc-96dca777fc.json`

### Method 2: Base64 Environment Variable

If you prefer using environment variables:

1. Encode your credentials file:
   ```bash
   # Linux/Mac
   base64 -i pics-storage-37f99-firebase-adminsdk-fbsvc-96dca777fc.json
   
   # Windows PowerShell
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("pics-storage-37f99-firebase-adminsdk-fbsvc-96dca777fc.json"))
   ```

2. Add to Render environment variables:
   ```
   FIREBASE_CREDENTIALS_BASE64=<paste-encoded-value>
   ```

3. Update Dockerfile to decode it (see updated Dockerfile section below)

## Updated Dockerfile for Base64 Credentials (Optional)

If using base64 environment variable, add this to your Dockerfile before the CMD:

```dockerfile
# Decode Firebase credentials if provided as base64
RUN if [ -n "$FIREBASE_CREDENTIALS_BASE64" ]; then \
    echo "$FIREBASE_CREDENTIALS_BASE64" | base64 -d > /app/pics-storage-37f99-firebase-adminsdk-fbsvc-96dca777fc.json; \
    fi
```

## Health Check

Render automatically checks the root endpoint (`/`). Your app already has this endpoint, so no additional configuration needed.

## Port Configuration

Render automatically sets the `PORT` environment variable. Update your Dockerfile CMD to use it:

```dockerfile
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
```

Or keep it as is - Render will map port 8000 automatically.

## Auto-Deploy

Render supports auto-deploy:
- **From Registry**: Push a new image tag, then update the image URL in Render
- **From GitHub**: Push to your branch, Render will rebuild automatically

## Troubleshooting

### Container won't start

1. Check logs in Render dashboard
2. Verify all environment variables are set
3. Ensure Firebase credentials file exists at the specified path

### MongoDB connection issues

#### SSL/TLS Handshake Errors

If you see errors like:
```
SSL handshake failed: [SSL: TLSV1_ALERT_INTERNAL_ERROR] tlsv1 alert internal error
ServerSelectionTimeoutError: SSL handshake failed
```

**Solution:**
1. **The Dockerfile has been updated** to include CA certificates - rebuild your image:
   ```bash
   docker build -t your-username/swapcircle-backend:latest .
   docker push your-username/swapcircle-backend:latest
   ```

2. **Verify MongoDB Atlas Network Access:**
   - Go to MongoDB Atlas → Network Access
   - Add IP Address: `0.0.0.0/0` (allows all IPs - for testing)
   - Or add Render's specific IP ranges (check Render docs for current ranges)

3. **Check Connection String Format:**
   - Should use `mongodb+srv://` for Atlas
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/`
   - Database name is set separately via `DATABASE_NAME` environment variable

4. **Verify Credentials:**
   - Username and password are correct
   - User has proper database permissions

#### Other MongoDB Issues

1. Verify MongoDB Atlas network access allows Render's IP ranges
2. Check connection string is correct
3. Ensure database name matches your Atlas cluster name

### Firebase credentials not found

1. Verify the file path in `FIREBASE_CREDENTIALS_PATH`
2. Check Secret Files section in Render
3. Ensure file name matches exactly

### CORS errors

1. Update `CORS_ORIGINS` to include your frontend domain
2. Use `https://` for production domains
3. Don't include trailing slashes

## Cost Considerations

- **Free Tier**: 750 hours/month, sleeps after 15 minutes of inactivity
- **Starter Plan**: $7/month, always on
- **Professional Plan**: $25/month, better performance

For production, consider the Starter plan to avoid cold starts.

## Next Steps

After deployment:
1. Test the health endpoint: `https://your-service.onrender.com/`
2. Update your frontend to use the new backend URL
3. Monitor logs in Render dashboard
4. Set up custom domain (optional, available on paid plans)

