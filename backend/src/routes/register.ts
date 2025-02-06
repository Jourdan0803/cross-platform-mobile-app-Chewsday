import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user';

const router = express.Router();

router.post('/', async (req: Request, res: Response): Promise<any> => {
    try {
        const { username, email, password } = req.body;
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });

        if (existingUser) {
            return res.status(400).json({ 
                message: 'User with this email or username already exists' 
            });
        }

        const user = new User({ username, email, password });
        await user.save();

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || '',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            message: 'Error registering user',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export default router;