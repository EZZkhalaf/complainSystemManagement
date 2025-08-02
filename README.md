# 📢 Complaint Management System – MERN Stack

A powerful, secure, and user-friendly system for submitting, tracking, and managing complaints. Built with the MERN stack and Tailwind CSS, featuring robust role-based access control, permission management, real-time email notifications, and comprehensive API documentation via Swagger.

---

## 🚀 Features

### 🧾 Complaint Handling

* **Submit Complaints:** Users can file new complaints through an intuitive UI.
* **Track Status:** Complaints are timestamped and tracked through stages (e.g., Pending, In Progress, Resolved).
* **Manage Complaints:** Admins and Moderators can review, update statuses, and resolve complaints.

### 🔐 Role-Based Access Control (RBAC)

* **Dynamic Roles:** Admins can create, update, and delete roles (e.g., `moderator`, `support_agent`).
* **Custom Permissions:** Assign granular permissions (e.g., `view_complaint`, `delete_user`) to each role.
* **Secure Enforcement:** All protected endpoints verify permissions server-side.

### 📩 Email Notifications

* **Account Verification:** Users receive a verification email upon registration.
* **Status Updates:** Automatic notifications when complaint status changes.
* **Transactional Emails:** Powered by Nodemailer with configurable SMTP settings.

### 📘 Swagger API Documentation

* **Interactive Docs:** Explore and test endpoints via Swagger UI.
* **Endpoint Coverage:** Full documentation for user auth, complaints, roles, permissions, and admin summary.
* **Access URL:** `/api-docs` (e.g., `http://localhost:5000/api-docs`).

### 🖥️ Admin Dashboard

* **Overview:** Real-time system summary (total users, complaints, roles).
* **Role Management:** Create, edit, and delete roles and their permissions.
* **User Assignments:** Add or remove users from roles.

### 📦 Frontend

* **Tech:** React.js, Tailwind CSS, React Router DOM.
* **Responsive:** Mobile-first design with a clean, reusable component library.
* **Secure Routes:** Client-side protection based on user roles.

---

## 🛠️ Tech Stack

| Layer        | Technologies                                    |
| ------------ | ----------------------------------------------- |
| **Frontend** | React.js, Tailwind CSS, React Router DOM        |
| **Backend**  | Node.js, Express.js                             |
| **Database** | MongoDB (Mongoose ODM)                          |
| **Auth**     | JWT-based authentication                        |
| **Email**    | Nodemailer                                      |
| **Docs**     | Swagger (`swagger-jsdoc`, `swagger-ui-express`) |
| **Other**    | RESTful APIs, Custom Middleware, Role Guards    |

---

## ⚙️ Setup Instructions

### 🧪 Prerequisites

* Node.js (v14+)
* npm or yarn
* MongoDB instance (local or Atlas)

### 🖥️ Local Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/EZZkhalaf/complainSystemManagement.git
   cd complainSystemManagement
   ```

2. **Backend setup**

   ```bash
   cd backend
   npm install
   ```

   Create a `.env` file in `backend/` with:

   ```env
   PORT=5000
   CONNECTION_STRING=<Your MongoDB URI>
   JWT_SECRET=<Your JWT Secret>

   EMAIL_USER=<Your SMTP Email>
   EMAIL_PASS=<Your SMTP Password>
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   ```

   **Run the backend**

   ```bash
   npm start
   ```

3. **Frontend setup**

   ```bash
   cd ../frontend
   npm install
   npm start
   ```

Your app should now be running:

* Frontend: `http://localhost:3000`
* Backend API: `http://localhost:5000`
* Swagger UI: `http://localhost:5000/api-docs`

---

## 🔑 Admin Access

To access the admin dashboard, ensure you have a user with the `admin` role. You can seed an admin account or insert one manually via MongoDB.

---

## 🛡️ Security

* **JWT Authentication:** Protects all API routes.
* **Role & Permission Middleware:** Server-side checks before sensitive operations.
* **Environment Variables:** Secure credentials in `.env` files.

---

## 🧪 Sample Roles & Permissions

| Role          | Permissions                                             |
| ------------- | ------------------------------------------------------- |
| **admin**     | `add_user`, `delete_complaint`, `edit_role`, `view_all` |
| **moderator** | `view_complaint`, `update_status`                       |
| **user**      | `create_complaint`, `view_own_complaint`                |

---

## 📌 Future Improvements

* Audit logs for user actions and permission changes
* File attachments for complaints
* Real-time updates via WebSockets
* Multi-language support
* Automated tests and CI/CD pipeline

---

## 👨‍💻 Author

Built and maintained by **Ezzeldeen Khalaf**. Contributions and feedback are welcome.

---

## 📄 License

This project is licensed under the **MIT License**. Feel free to use and modify.
