import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user';

const router = express.Router();

router.post('/', async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, password } = req.body;
        console.log('Request received:', req.body);
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || '',
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            message: 'Error during login',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export default router;