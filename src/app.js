// app.js (Example - you might have this code directly in index.js too)
import express from 'express';
import cors from 'cors'; // Example middleware
import cookieParser from 'cookie-parser'; // Example middleware

const app = express();

// Your middleware setup
app.use(cors({
    origin: process.env.CORS_ORIGIN, // Ensure CORS_ORIGIN is set in your .env
    credentials: true
}));
app.use(express.json({ limit: "16kb" })); // To parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // To parse URL-encoded bodies
app.use(express.static("public")); // To serve static files
app.use(cookieParser()); // To parse cookies

// Your routes
app.get('/', (req, res) => {
    res.send('Welcome to the YouTube Clone Backend!');
});



export default app;