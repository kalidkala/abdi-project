Extend the existing basketball league standings web application by implementing a real backend and database system for persistent, multi-user data storage.

The frontend UI and features are already defined in chat.md. Now focus on backend logic, database design, and integration.

---

DATABASE REQUIREMENTS:

1. Use a cloud-based database to store all team data persistently.
2. Create a collection (or table) named "teams".
3. Each team record must include:

   * id (auto-generated)
   * name (string)
   * logo (image file or URL)
   * played (number)
   * wins (number)
   * losses (number)
   * scored (number)
   * conceded (number)
   * diff (number, calculated)
   * points (number, calculated)
   * createdAt (timestamp)

---

BACKEND FUNCTIONALITY:

Implement full CRUD operations:

1. CREATE (Add Team)

* Accept team data from frontend form
* Validate inputs (required fields, correct data types)
* Accept image upload (JPG/PNG only)
* Store image in cloud storage or convert to storable format
* Calculate:

  * diff = scored - conceded
  * points = wins × 2
* Save full team object in database

---

2. READ (Load Teams)

* Fetch all teams from database
* Return data sorted by:

  1. points (descending)
  2. diff (descending)
* Send data to frontend for rendering

---

3. UPDATE (Edit Team)

* Allow updating any team field
* Recalculate diff and points after update
* Save updated data to database
* Reflect changes immediately in UI

---

4. DELETE (Remove Team)

* Delete selected team from database
* Remove it from UI instantly

---

IMAGE HANDLING:

* Accept only JPG and PNG formats
* Store images in a cloud storage system or encode safely
* Return accessible image URLs for display in UI

---

DATA FLOW:

1. User submits form on frontend
2. Frontend sends request to backend/database
3. Backend:

   * Validates input
   * Processes calculations
   * Saves data
4. Backend returns updated dataset
5. Frontend re-renders standings table

---

REAL-TIME OR SYNC BEHAVIOR:

* Ensure that data updates are reflected immediately after:

  * Adding a team
  * Editing a team
  * Deleting a team

---

ERROR HANDLING:

* Handle invalid inputs (empty fields, wrong file type)
* Handle failed requests gracefully
* Provide clear feedback to user

---

SECURITY RULES (BASIC):

* Prevent invalid or malformed data from being stored
* Restrict file uploads to image formats only
* Ensure safe read/write operations

---

GOAL:

Transform the application from a local-only system into a fully functional, real-world app with persistent online data storage, reliable CRUD operations, and proper data handling for multiple users across devices.
Use a simple and beginner-friendly backend approach, but structure it like a production-ready system.