# Production Deployment Guide

This guide describes how to deploy the Palette Art Club portal to production using Vercel (frontend) and Render (backend REST API), with MongoDB Atlas as the database.

---

## Deployment Architecture

| Tier | Platform | Component | Configured / Triggered By |
| --- | --- | --- | --- |
| **Frontend** | [Vercel](https://vercel.com) | React SPA (`client/`) | Auto-builds on push to `main` |
| **Backend REST API** | [Render](https://render.com) | Express + Node (`server/`) | Auto-deploys on push to `main` |
| **Database** | [MongoDB Atlas](https://mongodb.com/atlas) | MongoDB Database Cluster | Connected via connection string URI |
| **Email Service** | SMTP Server | Nodemailer transporters | Configured via environment variables |

---

## 1. Database Setup (MongoDB Atlas)

1. Create a free shared cluster on **MongoDB Atlas**.
2. Under **Network Access**, allow access from anywhere (`0.0.0.0/0`) since Render's IP addresses are dynamic (or configure specific IPs if using static IP proxies).
3. Under **Database Access**, create a database user with read/write privileges.
4. Copy the connection string. Replace `<password>` and `<username>` with your database user credentials. Save this string for the backend configurations. It should resemble:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/palette?retryWrites=true&w=majority
   ```

---

## 2. Backend Deployment (Render)

1. Sign in to your [Render Dashboard](https://dashboard.render.com).
2. Click **New** → **Web Service**.
3. Link your GitHub account and select your repository (`Suchith2212/palette`).
4. Configure the service settings:
   - **Name**: `palette-api`
   - **Region**: Select a region close to your target audience (e.g. Singapore or Mumbai for IIT Gandhinagar).
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
5. Set the build and start commands:
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm run start`
6. Add the environment variables:
   - `NODE_ENV`: `production`
   - `MONGO_URI`: *[Your MongoDB Atlas Connection String]*
   - `JWT_SECRET`: *[A long secure random string for signing tokens]*
   - `CORS_ORIGIN`: *[Your Vercel deployment URL, e.g. `https://palette-fine-arts.vercel.app`]*
   - `EMAIL_HOST`: *[SMTP server host, e.g., `smtp.gmail.com` or custom server]*
   - `EMAIL_PORT`: *[SMTP port, e.g., `465` or `587`]*
   - `EMAIL_USER`: *[SMTP user email]*
   - `EMAIL_PASS`: *[SMTP user password / app password]*
   - `EMAIL_FROM_NAME`: `Palette Art Club`
   - `EMAIL_FROM_EMAIL`: `palette@iitgn.ac.in`

> [!NOTE]
> Do NOT configure `PORT` in Render environment variables. Render binds the application to an appropriate port automatically.

7. Click **Deploy Web Service**. Copy the service URL (e.g., `https://palette-api.onrender.com`).

---

## 3. Frontend Deployment (Vercel)

1. Log in to [Vercel](https://vercel.com).
2. Click **Add New** → **Project**.
3. Import the repository `Suchith2212/palette`.
4. Configure the project settings:
   - **Root Directory**: `client`
   - **Framework Preset**: **Vite** (will be automatically detected)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add the environment variables:
   - `VITE_API_ORIGIN`: *[Your Render Web Service URL from the previous step, e.g. `https://palette-api.onrender.com`]*

> [!IMPORTANT]
> Make sure `VITE_API_ORIGIN` does NOT have a trailing slash.

6. Click **Deploy**. Vercel will build the frontend React application and deploy it as a static SPA.

---

## 4. Post-Deployment Verification

1. Verify the backend health endpoint:
   Visit `https://your-render-service.onrender.com/api/health`. It should return:
   ```json
   { "status": "ok", "service": "palette-api" }
   ```
2. Visit your Vercel site URL. Open your browser console to check that network requests are hitting the Render URL successfully.
3. Register a test account, check if the email arrives with the verification code, and verify the user.

---

## 5. Media Uploads & Ephemeral Storage Warning

By default, the server is configured to save uploads locally (`server/uploads/`).
- On Render, local file changes are **ephemeral** and are wiped clean every time the service restarts or redeploys.
- **For Production Curation**: If you expect users to submit paintings/drawings in real time, you must either:
  1. Add a **Render Persistent Disk** mounted at `/uploads` in the service settings, or
  2. Implement an external cloud storage provider (like Cloudinary, AWS S3, or Firebase Storage) for media uploads.
- The pre-seeded images in `server/uploads/exhibition/` are committed in the repository, so they are always available.
