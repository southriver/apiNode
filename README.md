# apiNode

A simple RESTful API built with Node.js, Express, and SQLite.

This project provides backend functionality with CRUD endpoints using a lightweight SQLite database. It is designed for learning, testing, and small applications without requiring an external database server.

---

## Features

- REST API with Express
- SQLite database (file-based, no server required)
- CRUD operations
- JSON request/response handling
- Easy local setup
- Lightweight and portable

---

## Tech Stack

- Node.js
- Express
- SQLite
- JavaScript (ES6+)
- nodemon (dev)

---

## Why SQLite?

This project uses SQLite for simplicity:

- No database server needed
- No installation required
- Single file database
- Perfect for development and demos

The database is stored locally as:

```
database.sqlite
```

(or similar file inside the project)

---

## Project Structure

```
.
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── db/              # SQLite connection/config
│   ├── models/
│   └── index.js
├── database.sqlite
├── package.json
└── README.md
```

---

## Prerequisites

Install:

- Node.js 18+
- npm or yarn

Check:

```
node -v
```

---

## Getting Started

### Clone

```
git clone https://github.com/southriver/apiNode.git
cd apiNode
```

### Install dependencies

```
npm install
```

### Run server

Development:

```
npm run dev
```

Production:

```
npm start
```

Server runs at:

```
http://localhost:3000
```

---

## API Endpoints

| Method | Route | Description |
|--------|---------|-------------|
| GET | /api/items | Get all items |
| GET | /api/items/:id | Get item by id |
| POST | /api/items | Create new item |
| PUT | /api/items/:id | Update item |
| DELETE | /api/items/:id | Delete item |

---

## Example Request

Create item:

```
curl -X POST http://localhost:3000/api/items \
-H "Content-Type: application/json" \
-d '{"name":"Test item"}'
```

---

## Database Notes

- SQLite file is created automatically on first run
- No setup required
- To reset data, simply delete the `.sqlite` file

---

## Development

Optional:

```
npm install -g nodemon
npm run dev
```

---

## Docker (Optional)

```
FROM node:18
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3000
CMD ["npm", "start"]
```

---

## Contributing

1. Fork
2. Create branch
3. Commit
4. Open PR

---

## License

MIT
