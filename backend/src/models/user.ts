import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// user interface
export interface IUser extends Document {
    username: string;
    phone: string;
    email: string;
    password: string;
    createdAt: Date;
    favoriteDishes: string[];   
    favoriteRestaurants: string[]; 
    comparePassword(candidatePassword: string): Promise<boolean>;
}

// user schema
const userSchema = new Schema<IUser>({
    username: {
        type: String,
        required: [true, 'Please provide a username'],
        unique: true,
        trim: true
    },
    phone: {
        type: String,
        required: false,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        trim: true,
        lowercase: true,
        match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/ 
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    createdAt: {
        type: Date,
        default: new Date()
    },
    favoriteDishes: [{
        type: [String],
        default: []
    }],
    favoriteRestaurants: [{
        type: [String],
        default: []
    }]
});

// encrypt password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', userSchema);