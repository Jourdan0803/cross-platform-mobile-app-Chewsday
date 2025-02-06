import express, { Express } from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import registerRoute from './routes/register';
import loginRoute from './routes/login';
import profileRoute from './routes/profile';
import topRestaurantsRoute from './routes/topRestaurants';

dotenv.config();
const app: Express = express();

// connect to database
connectDB();

app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ limit: '10mb', extended: true })); 

// routes
app.use('/api/register', registerRoute);
app.use('/api/login', loginRoute);
app.use('/api/profile', profileRoute);
app.use('/api/top-restaurants', topRestaurantsRoute);

const PORT: number = parseInt(process.env.PORT || '8888');

app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});