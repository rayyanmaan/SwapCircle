# Docker Setup for SwapCircle Backend

This guide explains how to build and run the SwapCircle backend using Docker.

## Related Guides

- **[PUSH_TO_REGISTRY.md](./PUSH_TO_REGISTRY.md)** - How to push your Docker image to registries (Docker Hub, GHCR, etc.)
- **[RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)** - Complete guide for deploying on Render

## Prerequisites

- Docker installed on your system
- Docker Compose (usually included with Docker Desktop)

## Quick Start

### Using Docker Compose (Recommended)

Docker Compose will set up the backend service:

```bash
cd Backend
docker-compose up --build
```

This will:
- Build the backend Docker image
- Start the backend container
- Load environment variables from `.env` file
- Mount Firebase credentials

**Note:** This setup uses MongoDB Atlas (configured in `.env`). If you need a local MongoDB, you can add it to `docker-compose.yml`.

The backend will be available at `http://localhost:8000`

### Using Docker Only

#### Build the Image

```bash
cd Backend
docker build -t swapcircle-backend .
```

#### Run the Container

**Using .env file (Recommended):**

```bash
docker run -d \
  --name swapcircle-backend \
  -p 8000:8000 \
  --env-file .env \
  -e FIREBASE_CREDENTIALS_PATH=/app/pics-storage-37f99-firebase-adminsdk-fbsvc-96dca777fc.json \
  -v $(pwd)/pics-storage-37f99-firebase-adminsdk-fbsvc-96dca777fc.json:/app/pics-storage-37f99-firebase-adminsdk-fbsvc-96dca777fc.json:ro \
  swapcircle-backend
```

**Note for Windows PowerShell:**
```powershell
docker run -d `
  --name swapcircle-backend `
  -p 8000:8000 `
  --env-file .env `
  -e FIREBASE_CREDENTIALS_PATH=/app/pics-storage-37f99-firebase-adminsdk-fbsvc-96dca777fc.json `
  -v ${PWD}/pics-storage-37f99-firebase-adminsdk-fbsvc-96dca777fc.json:/app/pics-storage-37f99-firebase-adminsdk-fbsvc-96dca777fc.json:ro `
  swapcircle-backend
```

**Or pass environment variables directly:**

```bash
docker run -d \
  --name swapcircle-backend \
  -p 8000:8000 \
  -e MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/ \
  -e DATABASE_NAME=Cluster0 \
  -e SECRET_KEY=your-secret-key \
  -e FIREBASE_STORAGE_BUCKET=pics-storage-37f99.firebasestorage.app \
  -e FIREBASE_CREDENTIALS_PATH=/app/pics-storage-37f99-firebase-adminsdk-fbsvc-96dca777fc.json \
  -v $(pwd)/pics-storage-37f99-firebase-adminsdk-fbsvc-96dca777fc.json:/app/pics-storage-37f99-firebase-adminsdk-fbsvc-96dca777fc.json:ro \
  swapcircle-backend
```

## Environment Variables

The following environment variables can be set in your `.env` file:

- `MONGODB_URI`: MongoDB connection string (e.g., `mongodb+srv://user:password@cluster.mongodb.net/`)
- `DATABASE_NAME`: Database name (e.g., `Cluster0`)
- `JWT_SECRET_KEY` or `SECRET_KEY`: Secret key for JWT tokens (docker-compose.yml automatically maps `JWT_SECRET_KEY` to `SECRET_KEY` if present)
- `FIREBASE_STORAGE_BUCKET`: Firebase storage bucket name (e.g., `pics-storage-37f99.firebasestorage.app`)
- `FIREBASE_CREDENTIALS_PATH`: Path to Firebase credentials JSON file (relative path in `.env`, absolute in container)
- `CORS_ORIGINS`: Comma-separated list of allowed CORS origins (optional, default: `http://localhost:3000`)

**Note:** The `docker-compose.yml` automatically loads your `.env` file. The `FIREBASE_CREDENTIALS_PATH` is overridden to use the absolute path in the container (`/app/pics-storage-37f99-firebase-adminsdk-fbsvc-96dca777fc.json`).

## Volumes

The Docker setup mounts:
- Firebase credentials JSON file (read-only) - mounted to `/app/pics-storage-37f99-firebase-adminsdk-fbsvc-96dca777fc.json`
- `static` directory (for local file storage, optional)

## Building for Production

For production builds, you may want to:

1. Use a specific Python version
2. Remove development dependencies
3. Use multi-stage builds to reduce image size
4. Set up proper secrets management

Example production build:

```bash
docker build -t swapcircle-backend:production .
```

## Troubleshooting

### Container won't start

Check logs:
```bash
docker logs swapcircle-backend
```

### MongoDB connection issues

If using MongoDB Atlas, ensure:
- Your IP address is whitelisted in MongoDB Atlas network access
- The connection string in `.env` is correct
- The database name matches your Atlas cluster name

If using a local MongoDB instance, use:
- `host.docker.internal` (Mac/Windows)
- Host machine IP address (Linux)

### Firebase credentials not found

Ensure the Firebase credentials file is mounted correctly:
```bash
docker run ... -v $(pwd)/pics-storage-37f99-firebase-adminsdk-fbsvc-96dca777fc.json:/app/pics-storage-37f99-firebase-adminsdk-fbsvc-96dca777fc.json:ro ...
```

The file should be in the `Backend` directory and match the filename in your `.env` file.

### Port already in use

Change the port mapping:
```bash
docker run -p 8001:8000 ...
```

## Stopping Containers

### Docker Compose
```bash
docker-compose down
```

### Docker
```bash
docker stop swapcircle-backend
docker rm swapcircle-backend
```

## Cleaning Up

Remove containers:
```bash
docker-compose down
```

Remove the image:
```bash
docker rmi swapcircle-backend
```

**Note:** Since we're using MongoDB Atlas, there are no local volumes to clean up.

