import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import deliveryRoutes from './routes/deliveries.js'

const app = express();

app.use(cors());
app.use(express.json());

// Connects to local MongoDB instance
mongoose.connect('mongodb://127.0.0.1:27017/deliverySystem')
   .then(() => console.log('MongoDB connected successfully'))
   .catch(err => console.error('Database connection error:', err));

app.use('/api/deliveries',deliveryRoutes);

app.listen(5000, () => console.log('Backend server running port 5000'));
