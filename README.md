📢 Complaint Management System – MERN Stack
A full-featured Complaint Management System built with the MERN stack, secured with a robust role-based access control system, featuring permission management, real-time email notifications, and a user-friendly Tailwind CSS interface.

🚀 Features

🧾 Complaint Handling
Users can submit complaints via a user-friendly interface.

Admins and Moderators can manage, update, and resolve complaints.

Complaints are tracked with timestamps and status updates.

🔐 Role-Based Access Control (RBAC)
Admins can create, update, and delete roles (e.g., moderator, support agent).

Each role can have its own customizable set of permissions (e.g., view_complaint, delete_user).

Permissions are securely checked at the backend before executing any sensitive action.

📩 Email Notifications
Users receive email alerts when:

They register and need to verify their account.

The status of their complaint changes (e.g., from "pending" to "resolved").

Implemented using nodemailer for reliable transactional email delivery.

📘 Swagger API Documentation
Full backend API documented using Swagger (OpenAPI).

Developers can test endpoints directly from the Swagger UI.

Available at: /api-docs

🖥️ Admin Dashboard
Admins have access to a panel where they can:

View system summaries (e.g., total users, complaints).

Manage user roles and permissions.

Add or remove users from roles/groups.

📦 Frontend
Built with React.js and Tailwind CSS for fast, responsive UI.

Includes:

Authenticated pages for admins, moderators, and users.

Mobile-friendly layout.

Reusable, clean UI components.

🛠️ Tech Stack

| Layer        | Tools Used                                             |
| ------------ | ------------------------------------------------------ |
| **Frontend** | React.js, Tailwind CSS, React Router DOM               |
| **Backend**  | Node.js, Express.js                                    |
| **Database** | MongoDB (via Mongoose ODM)                             |
| **Auth**     | JWT-based authentication                               |
| **Email**    | Nodemailer                                             |
| **Docs**     | Swagger (via `swagger-jsdoc` and `swagger-ui-express`) |
| **Other**    | RESTful APIs, Middleware, Role Guards                  |


⚙️ Setup Instructions
🧪 Prerequisites
Node.js & npm

MongoDB instance (local or cloud like MongoDB Atlas)

🖥️ Local Installation
1. Clone the Repo


git clone https://github.com/EZZkhalaf/complainSystemManagement.git
cd complainSystemManagement

2. Backend Setup
    cd backend
    npm install

Create a .env file in backend/:
    

    PORT=5000
    # CONNECTION_STRING=YOURCONNECTIONSTRING

    CONNECTION_STRING=YOURCONNECTIONSTRING
    JWT_SECRET="YOUJSONWEBTOKENSTRING"


    EMAIL_USER=youEmail@gmail.com
    EMAIL_PASS="You String Password"

    EMAIL_HOST=smtp.gmail.com
    EMAIL_PORT=587

    Run The Backend
    npm start
3. Frontend Setup
    cd ../frontend
    npm install
    npm start

🔑 Admin Access
To access the admin panel, use an account with the admin role and the correct permissions. If none exists, you can insert one manually into the database or set a default in the seed script.

📚 API Documentation
Swagger UI is available at:
http://localhost:5000/api-docs

Generated using swagger-jsdoc and includes routes for:

User registration/login

Complaint CRUD

Role and permission management

Admin dashboard summary


📬 Email Service
Transactional emails are powered by Nodemailer.

Used for:

Registration verification

Complaint status updates

Password resets (optional)

🔐 Security
JWT-based authentication

Middleware to check user roles and specific permissions

Backend-only access control (not just UI hiding)


🧪 Sample Roles and Permissions
| Role        | Permissions                                             |
| ----------- | ------------------------------------------------------- |
| `admin`     | `add_user`, `delete_complaint`, `edit_role`, `view_all` |
| `moderator` | `view_complaint`, `update_status`                       |
| `user`      | `create_complaint`, `view_own_complaint`                |


📌 To Do (Future Ideas)
User activity logs

File attachments in complaints

Live notifications using WebSockets

Multi-language support

Audit trail for permission changes

👨‍💻 Author
Built by Ezzeldeen Khalaf
Open for contributions and suggestions.