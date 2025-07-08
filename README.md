# Real-Time Collaborative Kanban Board

## Project Overview
This project is a web-based collaborative to-do board application, similar to a minimal Trello board, designed to allow multiple users to log in, manage tasks, and see changes happen in real-time. [cite_start]It includes core Kanban functionalities, user authentication, and unique business logic challenges like "Smart Assign" and "Conflict Handling"[cite: 3].

## Tech Stack Used
* [cite_start]**Frontend:** React (Custom UI, no external UI frameworks) [cite: 17, 25]
    * [cite_start]`@hello-pangea/dnd`: For drag-and-drop functionality 
    * `axios`: For API communication
    * [cite_start]`socket.io-client`: For real-time updates 
* [cite_start]**Backend:** Node.js with Express.js [cite: 5]
    * [cite_start]`MongoDB`: Database for persistent storage [cite: 5]
    * `Mongoose`: ODM for MongoDB
    * [cite_start]`bcryptjs`: For password hashing [cite: 7]
    * [cite_start]`jsonwebtoken`: For JWT-based authentication [cite: 7]
    * [cite_start]`socket.io`: For WebSocket real-time communication 
    * `dotenv`: For environment variable management
    * `express-async-handler`: To simplify async error handling in controllers
    * `cors`: For handling Cross-Origin Resource Sharing

## Setup and Installation Instructions

To run this project locally, follow these steps:

### Prerequisites
* Node.js (LTS version recommended)
* MongoDB instance (local or cloud-hosted like MongoDB Atlas)

### 1. Clone the repository
```bash
git clone https://github.com/vaibhav-bhosale1/real-time-todo-board
cd real-time-todo-board
2. Backend Setup
Navigate to the backend directory:

Bash

cd backend
Create a .env file in the backend directory and add the following environment variables:

PORT=5000
MONGO_URI=<Your_MongoDB_Connection_String>
JWT_SECRET=<A_Strong_Random_Secret_Key>
NODE_ENV=development # Set to 'production' for deployment builds
Replace <Your_MongoDB_Connection_String> with your MongoDB URI (e.g., mongodb://localhost:27017/kanban-board or your Atlas connection string).
Replace <A_Strong_Random_Secret_Key> with a unique, long string for JWT signing.

Install backend dependencies:

Bash

npm install
Start the backend server:

Bash

npm run dev # Or `node server.js`
The backend server will run on http://localhost:5000 (or your specified PORT).

3. Frontend Setup
Open a new terminal and navigate to the frontend directory:

Bash

cd frontend
Create a .env file in the frontend directory and add the following environment variable:

VITE_BACKEND_URL=http://localhost:5000 # Or your deployed backend URL in production
Install frontend dependencies:

Bash

npm install
Start the frontend development server:

Bash

npm run dev
The frontend application will typically open in your browser at http://localhost:5173 or http://localhost:3000.

Features List and Usage Guide
Core Features

User Authentication: Secure sign-up and login with JWT-based authentication.



Kanban Board: A three-column board (Todo, In Progress, Done) to manage tasks.

Task Management:


Create Task: Add new tasks with title, description, assigned user, status, and priority.


Edit Task: Modify existing task details.

Delete Task: Remove tasks from the board.


Drag & Drop: Easily move tasks between columns or reorder within a column.


Real-Time Sync: All task changes (create, update, delete, drag-drop, assign) are instantly visible to all active users via Socket.IO.


Activity Log Panel: Displays the last 20 actions performed on the board, updated in real-time.


Unique Logic Challenges

Smart Assign: A "Smart Assign" button on each task assigns the task to the user with the fewest currently active (Todo or In Progress) tasks, balancing the workload.

Conflict Handling: If multiple users attempt to edit the same task concurrently, the system detects the conflict. A modal appears showing "Your Attempted Changes" and the "Current Version (from Database)". Users can choose to "Overwrite" with their changes or "Discard Changes" and accept the latest database version.

Validation:

Task titles are unique per board.

Task titles cannot be the same as column names ("Todo", "In Progress", "Done").

Usage Guide
Register/Login: Navigate to the registration or login page to create an account or sign in.

View Board: Upon successful login, you'll see the Kanban board.

Add Task: Use the "Add New Task" button to create a task.

Manage Tasks: Drag and drop tasks, click "Edit" to modify, "Delete" to remove.

Smart Assign: Click "Smart Assign" on a task to automatically assign it.

Activity Log: Observe the activity panel for live updates of all actions.

Conflict Test: Open the app in two different browser tabs (or with two different users), edit the same task simultaneously, and observe the conflict resolution modal.

Explanations for Smart Assign and Conflict Handling Logic
Smart Assign Logic
The "Smart Assign" feature is implemented on the backend to ensure fair task distribution. When a user clicks the "Smart Assign" button on a task:

The backend API endpoint is triggered.

The server queries the database to get a count of "active" tasks (tasks with 'Todo' or 'In Progress' status) for all registered users.

It then identifies the user with the minimum number of active tasks.

The selected task's assignedTo field is updated with the ID of this least-burdened user.

A Socket.IO event is emitted to notify all connected clients of this assignment change in real-time.

Conflict Handling Logic
Conflict handling uses an optimistic concurrency control strategy:

Version Tracking: Each task document in MongoDB includes a version field (or Mongoose's __v field can be utilized) which increments with every successful update.

Client-Side Version: When a user fetches a task for editing, the frontend stores the version number of that task.

Update Request: When the user submits changes, the frontend sends the task's ID, the updated fields, and the original version it had when it was fetched.

Backend Validation: On the backend, before applying the update, the server checks if the version sent by the client matches the current version of the task in the database.

No Conflict: If the versions match, the update proceeds, and the task's version in the database is incremented.

Conflict Detected: If the versions do not match, it means another user has updated the task in the interim. The backend then rejects the client's update request and sends a 409 Conflict HTTP status code, along with the most recent version of the task from the database.

Frontend Resolution: Upon receiving a 409 status, the frontend displays a "Conflict Detected" modal. This modal presents the user with:

"Your Attempted Changes": The data the user tried to save.

"Current Version (from Database)": The up-to-date state of the task, fetched from the backend.
The user can then choose to "Overwrite" (forcing their changes, which then becomes the new latest version) or "Discard Changes" (abandoning their changes and accepting the database's current version).
