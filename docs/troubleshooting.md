# Troubleshooting Guide

This guide details common issues encountered during setup, development, or deployment of the Palette portal, along with solutions.

---

## 1. Database Connection Failures

### Symptom:
The backend server crashes on start with `Error: Mongoose connection error` or similar.

### Solutions:
1. **Local MongoDB instance not running**:
   - Ensure the MongoDB service is active.
   - On Windows: Run `Services.msc` and verify "MongoDB Server" status is "Running", or start it using `net start MongoDB`.
   - On macOS/Linux: Run `brew services start mongodb-community` or `sudo systemctl start mongod`.
2. **MongoDB Atlas IP Access Control**:
   - MongoDB Atlas clusters block all connections by default.
   - Go to your Atlas dashboard under **Security** → **Network Access**.
   - Add a rule for your local IP, or add `0.0.0.0/0` to allow connections from anywhere (common for Render builds).
3. **Invalid URI syntax**:
   - Check `server/.env` for typos in `MONGO_URI`.
   - Verify that password and usernames containing special characters are percent-encoded.

---

## 2. CORS (Cross-Origin Resource Sharing) Errors

### Symptom:
The browser console blocks requests with the error: `Access to XMLHttpRequest at '...' from origin '...' has been blocked by CORS policy`.

### Solutions:
1. **Mismatched Client URL**:
   - In production, check the Render backend environment variable `CORS_ORIGIN`. It must match your frontend Vercel URL (e.g. `https://palette-fine-arts.vercel.app`) exactly, **without a trailing slash**.
   - If multiple origins are allowed, separate them with commas (e.g. `https://palette.iitgn.ac.in,https://palette-fine-arts.vercel.app`).
2. **Local Environment Over-configuration**:
   - Ensure you leave the client-side `VITE_API_ORIGIN` variable **empty** for local development. If set, Axios bypasses the Vite dev server proxy and queries the port directly, triggering CORS policy blocks.

---

## 3. Email/Code Verification Not Sending

### Symptom:
Users register successfully but never receive the 6-digit numeric verification code in their inbox.

### Solutions:
1. **Missing SMTP Credentials**:
   - Verify that `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, and `EMAIL_PASS` are fully populated in the server environment configuration.
2. **SSL/TLS Port Misconfiguration**:
   - Standard ports: Secure SSL/TLS usually runs on port `465`. Non-secure or opportunistic TLS (STARTTLS) typically runs on port `587` or `25`. Make sure port and host match your provider.
3. **Google SMTP App Passwords**:
   - If using a Gmail account, standard passwords will be rejected. You must configure **2-Step Verification** on the Google Account and generate an **App Password** to use in `EMAIL_PASS`.

---

## 4. Broken Images or Upload Errors

### Symptom:
Artworks, profile pictures, or event poster uploads return HTTP `400 Bad Request` or `500 Server Error`, or show up as broken image links on the UI.

### Solutions:
1. **Multer File Size Limits**:
   - The server enforces upload file size constraints (typically 5MB-10MB). If a user attempts to upload a high-resolution raw camera image, the server returns a Multer limit error. Compress the image before uploading.
2. **Ephemeral Disk Deletions**:
   - Render web services recreate container filesystems on each redeploy. Artworks uploaded while running on the ephemeral disk will disappear. Attach a Render Persistent Disk mounted at `/uploads` or use cloud storage.
3. **Static File Serving Configuration**:
   - Ensure the frontend utilizes the `toMediaUrl` helper (`client/src/utils/mediaUrl.ts`) to prepend the API server origin to file paths, e.g., mapping `uploads/artwork/abc.png` to `https://api.yourdomain.com/uploads/artwork/abc.png`.
