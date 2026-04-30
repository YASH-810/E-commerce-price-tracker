# E-commerce Price Tracker

An automated price tracking web application that monitors product prices on e-commerce platforms (like Amazon), maintains a history of price changes, and visualizes the data through an intuitive and modern dashboard.

## 🌟 Features

- **Automated Price Scraping**: Uses a hybrid scraper (`requests` + `BeautifulSoup` for speed, falling back to `Selenium` for JavaScript-rendered pages).
- **Price History Visualization**: Interactive charts displaying historical price trends using Recharts.
- **Background Processing**: Asynchronous product price updates via a Flask backend.
- **Modern UI**: Built with Next.js and Tailwind CSS featuring a responsive, dark-themed, glassmorphism design.
- **Real-time Database**: Powered by Firebase Firestore for real-time synchronization between the backend scraper and the frontend application.

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js (React 19)
- **Styling**: Tailwind CSS
- **Components**: Radix UI
- **Icons**: Lucide React
- **Charts**: Recharts
- **Notifications**: Sonner

### Backend
- **Framework**: Flask (Python)
- **Scraping**: BeautifulSoup4, Selenium, WebDriver Manager
- **Database**: Firebase Admin SDK (Firestore)
- **Concurrency**: Python `threading`

---

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **Google Chrome** (required for Selenium scraper fallback)
- **Firebase Project** with Firestore Database enabled.

You will also need a **Firebase Service Account Key**:
1. Go to your Firebase Console -> Project Settings -> Service Accounts.
2. Click **Generate new private key**.
3. Save the downloaded JSON file as `serviceAccountKey.json` inside the `backend/` directory.

---

## 💻 Setup & Installation

### 1. Clone the repository
```bash
git clone <your-repository-url>
cd "E-commerce Price Tracker"
```

### 2. Backend Setup
```bash
cd backend

# Create a virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Make sure serviceAccountKey.json is placed in the backend folder
```

### 3. Frontend Setup
```bash
cd ../frontend

# Install Node.js dependencies
npm install

# Setup your Firebase client configuration (usually in a .env file or a config file inside frontend/src)
```

---

## 🏃‍♂️ Running the Application

### Start the Backend Server
```bash
cd backend
python app.py
```
*The Flask server will start on `http://localhost:5000`.*

### Start the Frontend Server
```bash
cd frontend
npm run dev
```
*The Next.js application will start on `http://localhost:3000`.*

---

## 🔌 API Endpoints

### `POST /update-products`
Triggers an asynchronous background job to iterate over all saved products in Firestore, scrape their latest prices, and update their price history.

**Response:**
```json
{
    "status": "started",
    "message": "Product update started successfully!"
}
```

