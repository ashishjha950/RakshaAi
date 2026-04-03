# Raksha AI 🛡️

Raksha AI is a comprehensive and secure safety application built to offer personal security, situational awareness, and emergency response tools. Designed with discretion in mind, the app supports people who may be in vulnerable situations by providing stealth recording, instant emergency alerts, and a supportive community.

## 🌟 Key Features

### 1. Advanced Stealth & Disguise Mechanisms
* **Gupt Mode (Stealth Shield):** Masks the Raksha app entirely as a functional Calculator or Wellness Tracker. While disguised, Gupt continuously records the screen silently in the background. It also listens passively for SOS voice keywords ("help", "danger", "bachao", "sos").
* **Disguise Mode:** Identical to Gupt Mode but handles silent *audio* recording instead of screen recording when keywords are detected.
* **Auto-Evidencing:** If an SOS keyword is recognized, both modes will stealthily capture recordings, encrypt them, and save them to the secure Evidence Vault, simultaneously sending out SOS emails, all while maintaining the disguise interface.
* **Secret Unlock:** Returning to the main app requires a predefined input sequence (e.g., typing '1234' into the fake calculator).

### 2. Emergency Response System (SOS)
* **One-Tap Overrides:** Immediate, accessible distress signal triggering.
* **Inner Circle Management:** Add, remove, and define trusted emergency contacts.
* **Rapid Alerting & Location:** Automatically fetches the user's GPS coordinates and broadcasts an SOS alert email with location context to the user's Inner Circle.

### 3. AI Safety Wingman (Sahayak)
* **Internal Mode (AI Chat):** A built-in AI assistant providing instantaneous safety advice, guiding users calmly through emergencies step-by-step, and offering templates for structured incident reporting.
* **External Mode (Quick-Action Overlay):** A floating control panel acting as a quick-accessibility overlay. Sends rapid SOS, records quick audio, dials emergency operators (e.g., 112), and copies an instant tracking link.

### 4. Security & Safety Tracking
* **Safe Journey:** Shares route and transit progress with selected contacts.
* **Safety Heatmap:** A visual interface map conveying safe/unsafe zones built around reported incidents.

### 5. Secure Evidence Vault
* A discreet partition of the app containing photos, videos, and recordings. It bridges directly with Cloudinary via backend APIs to ensure evidence remains in the cloud, preventing data loss if the device breaks, is stolen, or files are forcibly deleted locally.

### 6. Protected Community Hub
* Offers a protective, safe-space forum. Users can share stories, report incidents anonymously, attach media, and seek advice or support.

---

## 🛠️ Technology Stack

**Frontend (Client):**
* **Framework:** React 19 + Vite
* **Routing:** React Router DOM
* **Styling & UI:** TailwindCSS, Lucide React, Framer Motion
* **Maps & Geo:** Leaflet, React-Leaflet, Leaflet Routing Machine

**Backend (Server):**
* **Runtime:** Node.js + Express.js
* **Database:** MongoDB (via Mongoose)
* **Authentication:** JWT (JSON Web Tokens), bcrypt
* **File Uploads & Storage:** Multer, Cloudinary API
* **Emailing Service:** Nodemailer

---

## 🚀 Setup Instructions

### Prerequisites
* Node.js (v18+)
* MongoDB instances (local or Atlas)
* Cloudinary Account
* SMTP setup (e.g., Gmail with App Password) for NodeMailer

### 1. Clone the Repository
```bash
git clone https://github.com/ashishjha950/RakshaAi.git
cd RakshaAi
```

### 2. Set Up the Backend
```bash
cd backend
npm install
```

Ensure you create a `.env` file inside the `backend` directory with the following credentials:
```env
PORT=3000
MONGODB_URI=your_mongo_db_connection_string
JWT_SECRET=your_secret_key
# Nodemailer configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
# Cloudinary configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Run the backend development server:
```bash
npm run dev
```

### 3. Set Up the Frontend
Open a new terminal window or tab and run:
```bash
cd client
npm install
```

Start the Vite development server:
```bash
npm run dev
```

The application will be accessible at usually `http://localhost:5173`. Make sure the frontend proxy/API calls are properly routing to the backend (`http://localhost:3000`).
