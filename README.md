# 🧠 Real-Time Collaborative Kanban Board

A web-based collaborative Kanban board application (like a minimal Trello clone) that supports real-time updates, user authentication, and intelligent features like **Smart Assign** and **Conflict Handling**.

---

## 🚀 Tech Stack

### Frontend
- **React** (custom UI without external component libraries)
- `@hello-pangea/dnd` – Drag-and-drop support
- `axios` – For API communication
- `socket.io-client` – Real-time updates with WebSockets

### Backend
- **Node.js + Express.js**
- `MongoDB` – Persistent data storage
- `Mongoose` – MongoDB ODM
- `bcryptjs` – Password hashing
- `jsonwebtoken` – JWT-based authentication
- `socket.io` – Real-time bi-directional event communication
- `dotenv`, `cors`, `express-async-handler` – Utility libraries

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (LTS)
- MongoDB (Local or MongoDB Atlas)

### 1. Clone the Repository
```bash
git clone https://github.com/vaibhav-bhosale1/real-time-todo-board
cd real-time-todo-board
2. Backend Setup
bash
Copy
Edit
cd backend
Create a .env file:

env
Copy
Edit
PORT=5000
MONGO_URI=<Your_MongoDB_Connection_String>
JWT_SECRET=<A_Strong_Random_Secret_Key>
NODE_ENV=development
Install dependencies:

bash
Copy
Edit
npm install
Start the backend:

bash
Copy
Edit
npm run dev
Runs on: http://localhost:5000

3. Frontend Setup
bash
Copy
Edit
cd ../frontend
Create a .env file:

env
Copy
Edit
VITE_BACKEND_URL=http://localhost:5000
Install dependencies:

bash
Copy
Edit
npm install
Start the frontend:

bash
Copy
Edit
npm run dev
Default URL: http://localhost:5173

🧩 Features
✅ Core Features
User Authentication

Secure sign-up & login with JWT

Kanban Board

Three columns: Todo, In Progress, Done

Task Management

Create, Edit, Delete tasks

Assign users

Reorder & move via Drag and Drop

Real-Time Sync

All changes synced instantly via WebSocket

Activity Log

View the 20 most recent actions

🧠 Unique Logic Challenges
1. Smart Assign
Balances load across users by auto-assigning a task to the user with the fewest active tasks (Todo or In Progress).

Backend-driven logic ensures fairness.

2. Conflict Handling
Optimistic concurrency control using versioning:

Tasks store a version field.

When two users edit the same task:

If version matches → update proceeds.

If version mismatch → 409 Conflict.

The frontend shows a Conflict Resolution Modal:

"Your Attempted Changes"

"Current Version (from Database)"

Options: Overwrite or Discard Changes

📝 Usage Guide
Action	How To
Register/Login	Create an account or login to access the board
View Board	Default view after login, with real-time updates
Add Task	Click “Add New Task” button
Modify Task	Click a task to Edit or use the Delete button
Move Tasks	Drag and drop tasks across columns or reorder within a column
Smart Assign	Click Smart Assign to auto-assign based on workload
Conflict Test	Open two browser tabs and edit the same task simultaneously
Activity Panel	See real-time updates of all actions in the right-side activity panel


📌 Future Enhancements
Multi-board support per user

Role-based access (Admin, Viewer)

File attachments or image previews in tasks

Notifications for task assignments

