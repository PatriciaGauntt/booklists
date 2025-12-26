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


## Testing Strategy

This project uses Jest and Supertest to validate application behavior across multiple layers while maintaining clear separation of concerns.

### Test Coverage Overview

- Unit tests cover:

  - Controllers

  - Services

  - Models

  - Validation and error handling logic

- Route tests verify:

  - HTTP method and path configuration

  - Proper routing to controller methods

  - Expected status codes and response flow

Overall test coverage is approximately 82%, which reflects intentional testing design, not missing tests.

### Unit Testing

Unit tests focus on executing real application logic in isolation.

- Controllers are tested with mocked services

- Services are tested independently of the database

- Models validate schema behavior and data operations

- Error and edge-case paths are explicitly covered where appropriate

- This approach ensures business logic is fully exercised and reliable.

### Route Testing

Route tests are implemented using Supertest and intentionally mock controller methods.

This allows route tests to:

- Confirm endpoint paths and HTTP verbs

- Validate request/response handling

- Avoid duplicate execution of controller and service logic

- Remain fast and deterministic

Because controller logic is mocked during route tests, these tests do not increase code coverage percentages. This behavior is expected and aligns with industry best practices.

### Why Coverage Is Not 100%

Coverage below 100% reflects:

- Defensive guard clauses

- Error-handling branches

- Code paths requiring invalid or malformed input

These paths are intentionally isolated to unit tests rather than route tests to preserve test clarity and maintain separation of concerns.

### Running Tests

To run the full test suite and to generate coverage report:
```bash
npm run test 
```


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
├─ routes
│  └─ booklist.routes.json
├─ schemas
│  └─ booklist.json
├─ scripts
│  └─ backfill.duplicates.json
├─ server.js
├─ services
│  └─ booklist.service.js
└─ tests

```

📁 Sample Data Folder (/data)
    
The /data directory contains a JSON file used to preload the database with example book records.

### File Included
```bash
booklists-data.json
```
A structured dataset of books used for:

- seeding a local MongoDB instance
- running tests
- providing default records for fresh installs


If you want to load the sample books into your database:
```bash
mongoimport --db booklists --collection booklists --file ./data/booklists-data.json --jsonArray
```

This is optional—your API works without it—but importing it will give your Angular BookNest frontend a complete set of example titles to browse, edit, and search.

After loading your sample json data, you may want to run the following script to populate the isPotentialDuplicate boolean. This boolean is used in the frontend to flag potential books with multiple editions as well as duplicate copies.
```bash
node scripts/backfill.duplicates.js
```

