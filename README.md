# Inventory & Order Management System

A full-stack, production-ready Inventory and Order Management System built for the Software Engineer technical assessment.

## 🚀 Live Demo Links
- **Frontend (Vercel):** https://inventory-management-system-lilac-nine.vercel.app/
- **Backend API (Render):** https://inventory-backend-api-9aya.onrender.com/
- **API Documentation (Swagger):** https://inventory-backend-api-9aya.onrender.com/docs
- **Docker Hub Image:** https://hub.docker.com/repository/docker/raghavparasher/inventory-backend/general

## 🛠️ Technology Stack
- **Frontend:** React, Vite, Vanilla CSS (Glassmorphism UI)
- **Backend:** Python 3.11, FastAPI
- **Database:** PostgreSQL (SQLAlchemy ORM)
- **Infrastructure:** Docker, Docker Compose, GitHub Actions

## 🐳 How to Run Locally

You can run the entire application (Frontend, Backend, and Database) on your local machine using Docker Compose.

### Prerequisites
Make sure you have [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed on your machine.

### Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/RaghavParasher/inventory-management-system.git
   cd inventory-management-system
   ```

2. **Start the application:**
   Run the following command to build the images and start the containers:
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - **Frontend UI:** Open your browser and navigate to `http://localhost:5173`
   - **Backend API:** The API is accessible at `http://localhost:8000`
   - **Interactive API Docs:** Navigate to `http://localhost:8000/docs`

4. **Stop the application:**
   To stop the containers, press `Ctrl+C` in your terminal, or run:
   ```bash
   docker-compose down
   ```

## 🔐 Environment Variables
For local testing via Docker Compose, the necessary environment variables are already configured securely in the `docker-compose.yml` file. 
For production deployment, the following variables must be set on the hosting provider:
- `DATABASE_URL` (Backend - PostgreSQL connection string)
- `VITE_API_URL` (Frontend - URL of the deployed backend API)

## ✨ Core Features
- **Dashboard:** Live metrics and low-stock alerts.
- **Product Management:** Full CRUD operations with strict SKU uniqueness and quantity validation.
- **Customer Management:** Full CRUD operations with strict Email uniqueness.
- **Order Management:** Place orders, automatically reduce inventory, and dynamically calculate total amounts securely on the backend.
