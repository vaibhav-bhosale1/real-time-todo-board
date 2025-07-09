# 🧠 Real-Time Collaborative To-Do Board

A web-based collaborative to-do board application built with the MERN stack where multiple users can log in, manage tasks, and see changes happen in real time—similar to a minimal Trello board but with live sync and custom business logic.

## 🌐 Live Demo & Resources

- **🔗 [Live Application](https://real-time-todo-board.vercel.app/)**
- **📺 [Demo Video](https://your-demo-video-link.com)** - 5-10 minute walkthrough
- **📄 [Logic Document](./Logic_Document.pdf)** - Smart Assign & Conflict Handling explanation
- **💻 [GitHub Repository](https://github.com/vaibhav-bhosale1/real-time-todo-board)**

## 📋 Project Overview

This application addresses the challenge of real-time collaboration in task management. Built without any UI template libraries, it features custom business logic for intelligent task assignment and sophisticated conflict resolution when multiple users edit the same task simultaneously.

**Key Innovations:**
- Smart assignment algorithm that distributes tasks fairly across users
- Real-time conflict detection and resolution system
- Custom drag-and-drop interface with smooth animations
- Live activity logging with WebSocket synchronization

## 🚀 Features

### Core Functionality
- **🔐 Secure Authentication** - JWT-based user registration and login with hashed passwords
- **📋 Kanban Board** - Three columns: Todo, In Progress, Done
- **🎯 Complete Task Management** - Create, edit, delete, and move tasks with priority levels
- **🖱️ Drag & Drop Interface** - Intuitive drag-and-drop for task organization and reassignment
- **👥 Real-Time Collaboration** - WebSocket-based live updates across all connected users
- **📜 Activity Log Panel** - Track and display last 20 actions with live updates
- **🎨 Custom UI & Animations** - Fully custom styling with smooth animations (no CSS frameworks)
- **📱 Responsive Design** - Optimized for both desktop and mobile screens

### Unique Logic Features
- **🧠 Smart Assignment Algorithm** - Auto-assign tasks to users with the fewest active tasks
- **⚔️ Conflict Resolution System** - Handle simultaneous edits with version control and user choice
- **✅ Advanced Validation** - Unique task titles per board, preventing column name conflicts
- **🔄 Real-Time Sync** - Instant updates for all users without page refresh

## 🛠️ Tech Stack

### Backend (Node.js/Express + MongoDB)
- **Node.js + Express.js** - Server framework and API development
- **MongoDB + Mongoose** - Database and Object Document Mapping
- **Socket.IO** - Real-time WebSocket communication
- **JWT (jsonwebtoken)** - Authentication and authorization
- **bcryptjs** - Password hashing and security
- **CORS, dotenv, express-async-handler** - Middleware and configuration

### Frontend (React - No UI Template Libraries)
- **React** - UI library with custom-built components
- **@hello-pangea/dnd** - Drag and drop functionality
- **axios** - HTTP client for API communication
- **socket.io-client** - WebSocket client for real-time updates
- **Custom CSS** - No third-party CSS frameworks (Bootstrap, etc.)
- **Vite** - Build tool and development server

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (Local installation or MongoDB Atlas)

### 1. Clone the Repository
```bash
git clone https://github.com/vaibhav-bhosale1/real-time-todo-board.git
cd real-time-todo-board
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_secret_key
NODE_ENV=development
```

Start the backend server:
```bash
npm run dev
```
Backend will run at `http://localhost:5000`

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

Create a `.env` file in the frontend directory:
```env
VITE_BACKEND_URL=http://localhost:5000
```

Start the frontend application:
```bash
npm run dev
```
Frontend will run at `http://localhost:5173`

## 📖 Usage Guide

### Authentication
1. **Register**: Create a new account with email and password
2. **Login**: Access your account with secure JWT authentication

### Task Management
| Action | How To | Features |
|--------|--------|----------|
| **Create Task** | Click "Add New Task" in any column | Title, description, priority, assignment |
| **Edit Task** | Click on task card to open editor | Real-time conflict detection |
| **Delete Task** | Use delete option in task editor | Confirmation dialog |
| **Move Tasks** | Drag between columns or reorder | Updates status automatically |
| **Assign Tasks** | Select user from dropdown in task editor | Manual assignment |
| **Smart Assign** | Click "Smart Assign" button on task | Auto-assigns to user with fewest active tasks |

### Real-Time Features
- **Activity Log**: View last 20 actions in real-time on right panel
- **Live Updates**: See changes instantly across all user sessions
- **Conflict Resolution**: Edit same task in multiple tabs to test conflict handling

### Validation Rules
- Task titles must be unique per board
- Task titles cannot match column names ("Todo", "In Progress", "Done")
- All fields are validated on both frontend and backend

## 🧠 Smart Assign Logic Explanation

### Problem Statement
In collaborative environments, task distribution can become uneven, leading to workload imbalance among team members.

### Solution Approach
The Smart Assign feature implements an intelligent algorithm that ensures fair task distribution:

**Algorithm Steps:**
1. **Query Active Tasks**: Count each user's current tasks in "Todo" and "In Progress" columns
2. **Calculate Workload**: Determine which user has the fewest active tasks
3. **Intelligent Assignment**: Assign the task to the user with the lowest workload
4. **Tie-Breaking**: If multiple users have equal workloads, assign to the first user found
5. **Real-Time Update**: Broadcast the assignment to all connected users via WebSocket

**Business Logic:**
- Only counts active tasks (excludes "Done" tasks)
- Considers both "Todo" and "In Progress" as active workload
- Prevents overloading any single user
- Ensures fair distribution across the entire team

### Implementation Benefits
- **Automated Fairness**: Eliminates manual workload balancing
- **Real-Time Calculation**: Always uses current task distribution
- **Scalable**: Works with any number of users and tasks
- **Transparent**: Users can see the assignment logic in action

## ⚔️ Conflict Handling Logic Explanation

### Problem Statement
When multiple users edit the same task simultaneously, data conflicts can occur, potentially causing data loss or inconsistent states.

### Solution Approach
A sophisticated version-based conflict resolution system:

**Version Control System:**
1. **Task Versioning**: Each task maintains a version number (incremented on every update)
2. **Optimistic Locking**: Allow edits to proceed, check for conflicts on save
3. **Conflict Detection**: Compare current version with database version before saving
4. **User Notification**: If versions don't match, present conflict resolution options

**Conflict Resolution Flow:**
1. **User A** starts editing Task X (version 1)
2. **User B** simultaneously edits the same Task X (version 1)
3. **User A** saves first → Task X becomes version 2
4. **User B** attempts to save → System detects version mismatch
5. **Conflict Modal** appears showing:
   - User B's changes
   - Current database version (User A's changes)
   - Resolution options: "Overwrite" or "Discard Changes"

**User Experience:**
- **Transparent**: Users see exactly what changes conflict
- **Informed Choice**: Users can choose to overwrite or merge manually
- **Data Safety**: No automatic overwrites - user always decides
- **Real-Time**: All users see the final resolved state immediately

### Implementation Benefits
- **Data Integrity**: Prevents accidental data loss
- **User Control**: Empowers users to resolve conflicts consciously
- **Scalable**: Handles multiple simultaneous editors
- **Fault Tolerant**: Graceful handling of edge cases

## 📁 Project Structure

```
real-time-todo-board/
├── backend/
│   ├── config/
│   │   └── db.js                    # Database configuration
│   ├── controllers/
│   │   ├── actionLogController.js   # Activity log handlers
│   │   ├── taskController.js        # Task CRUD operations
│   │   └── userController.js        # User authentication
│   ├── middleware/
│   │   ├── authMiddleware.js        # JWT authentication
│   │   └── errorMiddleware.js       # Error handling
│   ├── models/
│   │   ├── ActionLog.js             # Activity log schema
│   │   ├── Task.js                  # Task schema
│   │   └── User.js                  # User schema
│   ├── routes/
│   │   ├── actionLogRoutes.js       # Activity log API routes
│   │   ├── taskRoutes.js            # Task API routes
│   │   └── userRoutes.js            # User API routes
│   ├── utils/
│   │   ├── generateToken.js         # JWT token generation
│   │   └── logActions.js            # Activity logging utility
│   ├── .env                         # Environment variables
│   ├── package.json                 # Backend dependencies
│   └── server.js                    # Main server file
├── frontend/
│   ├── src/
│   │   ├── assets/                  # Static assets
│   │   ├── components/
│   │   │   ├── ActivityLog.jsx      # Activity log component
│   │   │   ├── common/
│   │   │   │   ├── Modal.jsx        # Reusable modal component
│   │   │   │   └── Spinner.jsx      # Loading spinner
│   │   │   ├── ConflictResolutionModal.jsx  # Conflict handling
│   │   │   ├── KanbanBoard.jsx      # Main kanban board
│   │   │   ├── KanbanColumn.jsx     # Column component
│   │   │   ├── TaskCard.jsx         # Individual task card
│   │   │   └── TaskForm.jsx         # Task creation/editing form
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx        # Login page
│   │   │   ├── RegisterPage.jsx     # Registration page
│   │   │   └── index.jsx            # Main app page
│   │   ├── services/
│   │   │   ├── authService.js       # Authentication API calls
│   │   │   ├── taskService.js       # Task API calls
│   │   │   └── socketService.js     # Socket.IO client
│   │   ├── styles/
│   │   │   ├── components/          # Component-specific styles
│   │   │   └── main.jsx             # Global styles
│   │   ├── App.jsx                  # Main app component
│   │   └── main.jsx                 # React entry point
│   ├── public/
│   │   └── index.html               # HTML template
│   ├── .env                         # Environment variables
│   ├── package.json                 # Frontend dependencies
│   └── vite.config.js               # Vite configuration
└── README.md
```

## 💻 Code Examples

### Backend API Endpoints

```javascript
// Task Controller Example
const createTask = async (req, res) => {
  try {
    const { title, description, column } = req.body;
    const task = new Task({
      title,
      description,
      column,
      createdBy: req.user.id,
      version: 1
    });
    
    const savedTask = await task.save();
    // Emit real-time update
    req.io.emit('taskCreated', savedTask);
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
```

### Frontend Component Example

```jsx
// KanbanBoard Component
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import KanbanColumn from './KanbanColumn';
import socket from '../services/socketService';

const KanbanBoard = () => {
  const [tasks, setTasks] = useState([]);
  const [columns] = useState(['todo', 'inProgress', 'done']);

  useEffect(() => {
    // Listen for real-time updates
    socket.on('taskUpdated', (updatedTask) => {
      setTasks(prev => prev.map(task => 
        task._id === updatedTask._id ? updatedTask : task
      ));
    });

    return () => socket.off('taskUpdated');
  }, []);

  const onDragEnd = (result) => {
    // Handle drag and drop logic
    if (!result.destination) return;
    
    const { source, destination, draggableId } = result;
    // Update task position and column
    updateTaskPosition(draggableId, destination.droppableId);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="kanban-board">
        {columns.map(column => (
          <KanbanColumn
            key={column}
            column={column}
            tasks={tasks.filter(task => task.column === column)}
          />
        ))}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;
```

### Socket.IO Real-time Updates

```javascript
// Backend Socket Configuration
const configureSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('joinBoard', (boardId) => {
      socket.join(boardId);
    });

    socket.on('taskUpdate', (taskData) => {
      // Broadcast to all users in the board
      socket.to(taskData.boardId).emit('taskUpdated', taskData);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};
```

## 📄 Project Structure

The application is deployed and ready to use:
- **Frontend**: Deployed on Vercel
- **Backend**: Deployed on Render
- **Database**: MongoDB Atlas

For your own deployment:
1. Update environment variables with production URLs
2. Configure CORS settings for your domain
3. Set up MongoDB Atlas for production database

## 🤝 Assignment Submission

This project was built as part of a Full Stack Development assignment with the following deliverables:

### ✅ Completed Requirements
- **✅ GitHub Repository**: Public repository with meaningful commits
- **✅ Live Deployment**: Both frontend and backend deployed and accessible
- **✅ Demo Video**: 5-10 minute walkthrough with voiceover
- **✅ Logic Document**: Detailed explanation of Smart Assign and Conflict Handling
- **✅ Custom UI**: No template libraries used, fully custom styling
- **✅ Real-Time Features**: WebSocket implementation for live collaboration
- **✅ Advanced Logic**: Smart assignment and conflict resolution systems

### 📋 Submission Links
- **GitHub Repository**: [https://github.com/vaibhav-bhosale1/real-time-todo-board](https://github.com/vaibhav-bhosale1/real-time-todo-board)
- **Live Application**: [https://real-time-todo-board.vercel.app/](https://real-time-todo-board.vercel.app/)
- **Demo Video**: [Link to demo video](https://your-demo-video-link.com)
- **Logic Document**: [Logic_Document.pdf](./Logic_Document.pdf)

### 🎯 Technical Highlights
- **No UI Framework**: Built entirely with custom CSS and React components
- **WebSocket Integration**: Real-time updates using Socket.IO
- **Custom Business Logic**: Smart assignment algorithm and conflict resolution
- **Responsive Design**: Works on desktop and mobile without CSS frameworks
- **Security**: JWT authentication with hashed passwords
- **Validation**: Unique task titles and column name validation
- **Error Handling**: Comprehensive error handling and user feedback

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Vaibhav Bhosale**
- GitHub: [@vaibhav-bhosale1](https://github.com/vaibhav-bhosale1)
- Portfolio: [Your Portfolio Link]

## 🙏 Acknowledgments

- Socket.IO for real-time communication
- MongoDB for robust data storage
- React community for excellent documentation
- All contributors and testers

---

**⭐ Star this repository if you found it helpful!**
