import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true } // Will store the bcrypt hash
});

export default mongoose.model('Admin', adminSchema);