# Logic Document: Real-Time Collaborative To-Do Board

This document explains the core logic behind two unique challenges implemented in the Real-Time Collaborative To-Do Board: **Smart Assign** and **Conflict Handling**.

---

## 1. Smart Assign Implementation

The "Smart Assign" feature is designed to efficiently distribute tasks among users by automatically assigning a task to the user who currently has the lightest workload. This helps in balancing responsibilities in a collaborative environment.

### How it Works (Step-by-Step):

**1. User Action**: When a user clicks the "Smart Assign" button on a specific task within the Kanban board, a request is sent to the backend server.

**2. Identify Active Tasks**: The backend first identifies all active users in the system. For each user, it then queries the database to count their "active tasks." An "active task" is defined as any task that is currently in the 'Todo' or 'In Progress' status, regardless of whether the user created it or was assigned to it.

**3. Calculate Workload**: The system compiles a list of all users along with their respective counts of active tasks.

**4. Find Least Burdened User**: This list is then sorted to find the user who has the minimum number of active tasks. This user is considered the "least burdened."

**5. Assign Task**: The selected task's `assignedTo` field is then updated in the database to point to the ID of this least-burdened user.

**6. Real-Time Notification**: After the assignment is successfully updated in the database, the backend immediately broadcasts a real-time update event (via Socket.IO) to all connected clients. This ensures that everyone sees the task's new assignment instantly, without needing to refresh their boards.

**7. Action Logging**: The system also logs this assignment action, recording who performed the smart assign, which task was affected, and who it was assigned to, making it visible in the activity log.

This process ensures that tasks are intelligently distributed, preventing any single user from becoming overwhelmed while others remain idle.

---

## 2. Conflict Handling Implementation

Conflict handling is crucial in real-time collaborative applications to prevent data loss when multiple users attempt to modify the same piece of data (in this case, a task) simultaneously. Our system employs an **Optimistic Concurrency Control** strategy.

### How it Works (Step-by-Step):

**1. Version Tracking**: Every task in the database has a version number associated with it. This version number is a simple integer that starts at 0 (or 1) and increments by one every time the task is successfully updated.

**2. Client-Side Capture**: When a user opens a task for editing (or performs an action like dragging it to a new column, or triggering a smart assign), the frontend application retrieves the current version number of that task from the database and stores it locally.

**3. Update Attempt**: When the user finishes their edits and tries to save the task (or completes a drag-and-drop, or clicks smart assign), the frontend sends the updated task data along with the version number it originally obtained to the backend.

**4. Backend Validation (Conflict Detection)**: On the backend, before processing the update, the server performs a critical check:

   - It compares the version number sent by the client with the current version of the task actually stored in the database.
   
   - **If the versions match**: This means no other user has modified the task since the client fetched it. The update proceeds, the task is saved with the new data, and its version number in the database is incremented.
   
   - **If the versions do NOT match**: This indicates a conflict. Another user has successfully updated the task in the database while the current user was still making their changes. The backend rejects the current user's update request and sends a **409 Conflict** HTTP status code back to the frontend.

**5. Frontend Resolution**: When the frontend receives a 409 Conflict response, it immediately:

   - Fetches the absolute latest version of the task from the database.
   - Displays a "Conflict Detected!" modal to the user.
   - This modal presents two key pieces of information:
     - **"Your Attempted Changes"**: What the user was trying to save.
     - **"Current Version (from Database)"**: The task's most up-to-date state as it exists in the database (reflecting the other user's changes).
   
   - The user is then given two options to resolve the conflict:
     - **"Overwrite"**: If selected, the frontend sends the user's attempted changes to the backend again, but this time, it uses the version number from the "Current Version (from Database)". This effectively forces the user's changes to become the new state of the task, overriding the other user's changes. The task's version is then incremented.
     - **"Discard Changes"**: If selected, the frontend discards the user's unsaved changes, closes the modal, and refreshes the board to display the "Current Version (from Database)". This allows the user to see the other person's changes and re-apply their own if necessary.

### Example Scenario:

1. **User A** opens Task "Fix Bug" (Version 5).
2. **User B** simultaneously opens Task "Fix Bug" (also Version 5).
3. **User A** changes the description to "Bug fixed, testing now." and saves. The backend updates the task to Version 6.
4. **User B** changes the description to "Investigating bug." and tries to save. The frontend sends Version 5.
5. **Backend**: Sees client sent Version 5, but database is Version 6. Conflict! Sends 409 to User B.
6. **User B's Frontend**: Displays "Conflict Detected!" modal.
   - **"Your Changes"**: "Investigating bug." (Version 5)
   - **"Current Version"**: "Bug fixed, testing now." (Version 6, fetched live)
7. **User B's Choice**:
   - **If User B clicks "Overwrite"**: Frontend sends "Investigating bug." with Version 6. Backend updates to Version 7. (User A's fix is overwritten)
   - **If User B clicks "Discard Changes"**: Frontend refreshes, showing "Bug fixed, testing now." (User B's changes are lost)

This system ensures that no changes are silently lost and provides users with a clear mechanism to resolve discrepancies when they occur.

---

## Technical Benefits

### Smart Assign Benefits:
- **Automated Load Balancing**: Prevents manual workload distribution errors
- **Real-Time Calculation**: Always uses current task state for accurate assignment
- **Scalable Algorithm**: Efficiently handles any number of users and tasks
- **Transparent Process**: Users can observe fair distribution in action

### Conflict Handling Benefits:
- **Data Integrity**: Prevents silent data overwrites and loss
- **User Empowerment**: Gives users control over conflict resolution
- **Optimistic Performance**: Allows concurrent editing without blocking
- **Clear Communication**: Users understand exactly what conflicts occurred

Both systems work together to create a robust, user-friendly collaborative environment that maintains data consistency while providing an excellent user experience.
