# Local Development Guide

This guide is for developers and maintainers setting up the local workspace to build, test, and contribute code.

---

## 1. Prerequisites
- **Node.js** (v18 or higher is recommended)
- **npm** (v9 or higher)
- **MongoDB** running locally or a **MongoDB Atlas** cloud instance.

---

## 2. Setting Up the Local Workspace

1. **Install Root and Workspace Dependencies**
   From the repository root:
   ```bash
   npm install
   ```
   This will install top-level developer and build-helper dependencies. You also need to install dependencies in both the `client/` and `server/` directories:
   ```bash
   # Install client dependencies
   cd client && npm install
   
   # Install server dependencies
   cd ../server && npm install
   ```

2. **Configure Local Environment Files**
   Copy the example environment files to their active locations:
   
   - **For Server (Backend)**:
     Create `server/.env` based on `server/.env.example`.
     ```env
     PORT=3000
     MONGO_URI=mongodb://localhost:27017/palette
     JWT_SECRET=your_super_secret_local_dev_key
     CORS_ORIGIN=http://localhost:5173
     # Optional local SMTP credentials
     EMAIL_HOST=smtp.mailtrap.io
     EMAIL_PORT=2525
     EMAIL_USER=your_smtp_user
     EMAIL_PASS=your_smtp_password
     ```
   
   - **For Client (Frontend)**:
     Create `client/.env` based on `client/.env.example`.
     ```env
     # Leave empty locally because Vite dev server proxies requests automatically
     VITE_API_ORIGIN=
     ```

---

## 3. Running the Dev Servers

You can start both front-end and back-end concurrently using workspace helper scripts from the repository root:

- **Run Frontend Client**:
  ```bash
  npm run dev:client
  ```
  *Launches Vite on `http://localhost:5173`.*

- **Run Backend API Server**:
  ```bash
  npm run dev:server
  ```
  *Launches nodemon compiler watching `server/src/index.ts` on `http://localhost:3000`.*

---

## 4. Seeding & Managing Local Data

The backend includes several helper scripts to seed mock data in MongoDB. Run these commands from the `server/` directory:

- **Import Core Events & Admins**:
  ```bash
  npm run data:import
  ```
  *Seeds default users (including an admin account) and default past/present events.*

- **Wipe Seeding Data**:
  ```bash
  npm run data:destroy
  ```
  *Cleanses seeded events and users from the database.*

- **Seed Home Page / Current Carousel Items**:
  ```bash
  npm run data:seedCurrent
  ```
  *Seeds dynamic homepage events that appear in the homepage slider.*

- **Seed Mock Artworks**:
  ```bash
  npm run data:seedArtworks
  ```
  *Adds simulated user artwork entries for testing gallery features.*

- **Wipe Seeded Artworks**:
  ```bash
  npm run data:deleteArtworks
  ```
  *Clears seeded artworks, leaving user-submitted artworks intact.*

- **Fix Event Image Formats**:
  ```bash
  npm run data:fixEventImages
  ```
  *Normalizes database paths and format strings for event assets.*

---

## 5. Working on the Code

### Client-Side Proxies (Vite config)
The client compiles to a Single Page App. In local development:
- The Vite server is configured to proxy all `/api/*` and `/uploads/*` requests to the Express server running on port `3000`.
- This avoids CORS issues locally without requiring manual IP or port overrides.
- In production, requests are sent directly to the domain set in `VITE_API_ORIGIN`.

### Typechecking & Verification
Before pushing any commit or submitting a pull request, run verification checks to ensure TypeScript compiles without warning:
```bash
# Verify both client and server build pipelines
npm run verify
```
This is identical to the commands run by the automated GitHub Actions CI pipeline.
