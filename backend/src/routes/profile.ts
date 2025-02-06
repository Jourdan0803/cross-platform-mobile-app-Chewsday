import express, { Response } from 'express';
import { AuthRequest, authMiddleware } from '../middleware/auth';
import User from '../models/user';

const router = express.Router();

// get user info
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user?.userId).select('-password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// add favorite dish
router.post('/favorite/dish/:dishId', authMiddleware, async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const user = await User.findById(req.user?.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const dishId = req.params.dishId;
        if (!user.favoriteDishes.includes(dishId)) {
            user.favoriteDishes.push(dishId);
            await user.save();
        }

        res.json({ message: 'Dish added to favorites' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// add favorite restaurant
router.post('/favorite/restaurant/:restaurantId', authMiddleware, async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const user = await User.findById(req.user?.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const restaurantId = req.params.restaurantId;
        if (!user.favoriteRestaurants.includes(restaurantId)) {
            user.favoriteRestaurants.push(restaurantId);
            await user.save();
        }

        res.json({ message: 'Restaurant added to favorites' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// get user favorites
router.get('/favorites', authMiddleware, async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const user = await User.findById(req.user?.userId)
            .select('favoriteDishes favoriteRestaurants'); 

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            favoriteDishes: user.favoriteDishes,
            favoriteRestaurants: user.favoriteRestaurants
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// add user phone number
router.post('/upload/phone', authMiddleware, async (req: AuthRequest, res: Response): Promise<any> => {
    const { phone } = req.body; 
    if (typeof phone !== 'string' || phone.length < 10 || phone.length > 15) {
        return res.status(400).json({ message: 'Phone number must be a string between 10 and 15 characters' });
    }
    try {
        const user = await User.findById(req.user?.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.phone = phone; 
        await user.save(); 

        res.status(200).json({ message: 'Phone number updated successfully' });
    } catch (error) {
        console.error('Error updating phone number:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;