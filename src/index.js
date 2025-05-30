// index.js
import dotenv from 'dotenv';
import connectDB from './db/index.js'; // Adjust path if needed
import app from './app.js';

dotenv.config({
    path: './.env'
});

connectDB()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`⚙️ Server is running on port : ${process.env.PORT || 8000}`);
        });
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!! ", err);
    });

// ... rest of your express app setup, routes, etc.
// const app = express();
// app.use(...)