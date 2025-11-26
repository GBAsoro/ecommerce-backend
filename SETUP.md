# E-Commerce Backend - Quick Setup Guide

## Step 1: Create .env file

Copy the `.env.example` file to `.env`:

```powershell
Copy-Item .env.example .env
```

## Step 2: Configure MongoDB

Open the `.env` file and update the `MONGODB_URI`:

**Option A: Local MongoDB**
```
MONGODB_URI=mongodb://localhost:27017/ecommerce
```

**Option B: MongoDB Atlas (Cloud)**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce
```

## Step 3: Generate JWT Secrets

Replace the placeholder JWT secrets with secure random strings:

```
JWT_SECRET=your-generated-secret-here
JWT_REFRESH_SECRET=your-generated-refresh-secret-here
```

You can generate secure secrets using PowerShell:
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

## Step 4: Start the Server

```powershell
npm run dev
```

## Quick Setup (Automated)

Run this PowerShell command for automated setup:

```powershell
# Create .env from template
Copy-Item .env.example .env

# Generate JWT secrets
$jwt = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
$refresh = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})

# Update .env with local MongoDB and generated secrets
(Get-Content .env) -replace 'MONGODB_URI=.*', 'MONGODB_URI=mongodb://localhost:27017/ecommerce' -replace 'JWT_SECRET=.*', "JWT_SECRET=$jwt" -replace 'JWT_REFRESH_SECRET=.*', "JWT_REFRESH_SECRET=$refresh" | Set-Content .env

Write-Host "✓ Setup complete! Run 'npm run dev' to start the server" -ForegroundColor Green
```

## Verify Setup

After running the server, you should see:
```
Server running in development mode on port 5000
MongoDB Connected: localhost
```
