# Momentum Ledger - How to Run

This is your productivity app! Follow these simple steps to run it.

## What's Inside

```
momentum-ledger/
├── frontend/     <-- The website you see (React)
├── backend/      <-- The brain that saves your data (Node.js)
├── Dockerfile    <-- Instructions for Docker to build the app
└── docker-compose.yml  <-- Starts everything together
```

## Before You Start

Make sure you have **Docker** installed on your computer.
- Download Docker: https://www.docker.com/products/docker-desktop

## Step-by-Step Instructions

### Step 1: Open Terminal

Open Terminal (Mac) or Command Prompt (Windows) and go to this folder:

```bash
cd path/to/momentum-ledger
```

### Step 2: Create Your Settings File

Copy the example settings file:

```bash
cp .env.example .env
```

### Step 3: Set a Secret Key

Open the `.env` file and change this line:

```
JWT_SECRET=your-super-secret-key-change-this-in-production
```

Replace it with a random string. You can generate one by running:

```bash
openssl rand -hex 32
```

Copy the output and paste it after `JWT_SECRET=`

### Step 4: Start the App

Run this command:

```bash
docker compose up --build -d
```

Wait for it to finish (might take a few minutes the first time).

### Step 5: Open the App

Open your web browser and go to:

```
http://localhost:5000
```

You should see the Momentum Ledger login page!

## Helpful Commands

| What you want to do | Command |
|---------------------|---------|
| Start the app | `docker compose up -d` |
| Stop the app | `docker compose down` |
| See what's running | `docker compose ps` |
| See the logs | `docker compose logs -f` |
| Restart everything | `docker compose restart` |
| Delete everything and start fresh | `docker compose down -v` |

## Troubleshooting

### "Port already in use" error

Change the port in your `.env` file:
```
APP_PORT=3000
```
Then access the app at `http://localhost:3000`

### App won't start

Check the logs to see what's wrong:
```bash
docker compose logs app
```

### Forgot your password

Unfortunately, you'll need to create a new account. Your old tasks will be gone.

## Project Structure Explained

- **frontend/** - This is the React code that creates the website you see
  - `src/App.jsx` - The main component with all the UI
  - `src/api.js` - Functions that talk to the backend
  - `src/styles.css` - All the colors and styling

- **backend/** - This is the Node.js code that handles data
  - `index.js` - The main server file
  - `routes/auth.js` - Login and signup
  - `routes/tasks.js` - Create, edit, delete tasks
  - `routes/projects.js` - Create, edit, delete projects
  - `db.js` - Connects to MongoDB database

## Need Help?

If something doesn't work, try:
1. Stop everything: `docker compose down`
2. Start fresh: `docker compose up --build -d`
3. Check the logs: `docker compose logs -f`
