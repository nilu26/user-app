# 💻 MEAN Stack Developer Assignment - Full-Stack - NILESH KHOT

**GitHub Repository:** [https://github.com/nilu26/user-app](https://github.com/nilu26/user-app)

## Project Overview

This is a full-stack web application developed to fulfill the technical requirements of the MEAN Stack Developer assignment. The project implements a robust management system for Users, Categories, and Products, focusing on scalable solutions for handling large data operations (Bulk Upload and Report Generation).

The project is set up as a **monorepo**, with the frontend (Angular) and backend (Node.js/Express) running on separate ports.

---

## 🛠️ Technology Stack & Versions

| Component | Technology | Version | Notes |
| :--- | :--- | :--- | :--- |
| **Frontend** | Angular | 15.2.10 | Uses Proxy configuration to communicate with the backend. |
| **Backend** | Node.js & Express.js | 18.18.0 | Implemented using TypeScript and ES Modules (ESM). |
| **Database** | PostgreSQL (RDBMS) | (Any stable version) | Used as the persistent data store. |
| **Bulk Processing** | `multer`, `csv-parser` | | Handles large file uploads using streaming and batch inserts (prevents 504 timeout). |
| **Reporting** | `exceljs` | | Streams XLSX file generation for large reports (prevents 504 timeout). |

---

## 🚀 Setup and Installation Guide

### Prerequisites

1.  **Node.js:** Must be version `18.18.0`. (Recommended to use NVM).
2.  **Angular CLI:** Globally installed (`npm install -g @angular/cli`).
3.  **PostgreSQL:** Database server running locally (default port 5432).

### Step 1: Database Setup

1.  Create a PostgreSQL database named `assignment_db`.
2.  Execute the following SQL commands to set up the necessary tables (`users`, `categories`, `products`):

    ```sql
    CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL, 
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE categories (
        id SERIAL PRIMARY KEY,
        unique_id UUID DEFAULT gen_random_uuid(), 
        name VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE products (
        id SERIAL PRIMARY KEY,
        unique_id UUID DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        image TEXT,
        price NUMERIC(10, 2) NOT NULL,
        category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    ```

3.  Ensure your database connection details are correctly configured in `backend/.env`.

### Step 2: Backend Setup & Run

1.  Navigate to the backend directory: `cd backend`
2.  Install dependencies: `npm install`
3.  Create the file upload directory: `mkdir uploads`
4.  Run the backend server: `npm run dev` (Runs on **http://localhost:3000**)

### Step 3: Frontend Setup & Run

1.  Navigate to the frontend directory: `cd frontend`
2.  Install dependencies: `npm install`
3.  Run the Angular development server: `ng serve` (Runs on **http://localhost:4200**)

---

## 🧪 Postman Testing Guide

The complete API functionality can be tested using the attached Postman collection file.

1.  **Import:** Import the provided `.json` Postman Collection file.
2.  **Verify Base URL:** Ensure the `baseUrl` variable is set to `http://localhost:3000`.
3.  **Execution Order:** Run the requests in the collection sequentially, especially:
    * **Category CRUD:** Create a few categories first, as Product creation depends on valid `category_id` values (e.g., ID 1, 2, 3).
    * **Bulk Upload:** Use the provided sample CSV file for the `POST /api/products/bulk-upload` endpoint (ensure Body is set to `form-data` with key `file`).

---

## 🔑 Key Features Implemented

| Feature | Endpoint | Backend Logic Highlight |
| :--- | :--- | :--- |
| **User CRUD** | `/api/users/*` | Password hashing with `bcrypt`. |
| **Category CRUD** | `/api/categories/*` | Basic SQL CRUD. |
| **Product CRUD** | `/api/products/*` | CRUD with Foreign Key constraint linking to categories. |
| **Advanced Listing** | `GET /api/products?query...` | Single SQL query handles `LIMIT`/`OFFSET` (Pagination), `ORDER BY` (Sorting), and `WHERE` (Search/Filtering) efficiently. |
| **Bulk Upload** | `POST /api/products/bulk-upload` | Uses **CSV streaming** (`csv-parser`) and **batch inserts** to bypass 504 timeouts for large files. |
| **Report Generation** | `GET /api/products/report` | Uses **`exceljs` streaming** to write XLSX reports directly to the response, avoiding memory limits and timeouts. |

***

**(End of README.md Content)**