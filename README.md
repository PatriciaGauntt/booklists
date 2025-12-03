# booklists
## An Express Booklist for the Angular BookNest Project

This project features a lightweight backend built using a MEAN-style stack (MongoDB, Express.js, Angular and Node.js).
It supports full CRUD functionality—Create, Read, Update, and Delete—along with structured routing, JSON schema validation, and CORS configuration.

The backend provides data and functionality to the Angular-based BookNest frontend, allowing users to search, view, update, and manage books and comments.

## About the BookNest Project

Welcome to Our BookNest—a warm, digital extension of the bookshelves in our home.
Each location in the app corresponds to a real room, and every bookshelf within those rooms has been carefully numbered.
With this system, you can always find where a book lives by matching its room and shelf number to the map.

Detailed instructions for locating rooms and bookcases are available on the Overview page.
Simply identify the room, follow the numbering path around the walls, and you’ll always know exactly where a book belongs.

Whether you’re browsing for a favorite story or tracking down a new one, BookNest transforms our home into a gentle, guided wander through our personal library.

Enjoy exploring—and happy reading!

## How to Run the Project
### Prerequisites

Make sure you have the following installed:

- Node.js (v18+ recommended)
- npm (comes with Node)
- MongoDB running locally on mongodb://localhost:27017

### Backend Setup (Express API)

1. Navigate to the backend folder
```bash
cd booklists
```

2. Install dependencies
```bash
npm install
```

3. Start the development API
```bash
npx nodemon server.js
```

4. Once running, the API will be available at:

http://localhost:3000/api/v1/booklists

### Frontend Setup (Angular App)

See README.md in https://github.com/PatriciaGauntt/BookNest

```
Directory Tree of Project

booklists
├─ config
│  ├─ default.json
│  ├─ dev.json
│  ├─ prod.json
│  └─ test.json
├─ controllers
│  └─ booklist.controller.js
├─ data
│  └─ booklists-data.json
├─ eslint.config.js
├─ eslint.config.mjs
├─ jest.config.mjs
├─ lib
│  ├─ constants.js
│  ├─ logger.js
│  └─ mongo.js
├─ middleware
│  └─ error.middleware.js
├─ models
│  └─ booklist.model.js
├─ package-lock.json
├─ package.json
├─ README.md
├─ schemas
│  └─ booklist.json
├─ server.js
├─ services
│  └─ booklist.service.js
└─ tests

```