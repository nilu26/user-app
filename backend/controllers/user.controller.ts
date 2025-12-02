import { Request, Response } from 'express';
import * as UserModel from '../models/user.model.js';

export const registerUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Basic validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        // Check if user already exists
        const existingUser = await UserModel.findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists.' });
        }

        const newUser = await UserModel.createUser(email, password);

        // Exclude password hash from response
        res.status(201).json({ id: newUser.id, email: newUser.email });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
};

export const listAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await UserModel.findAllUsers();
        
        if (users.length === 0) {
            return res.status(200).json({ message: 'No users found.', data: [] });
        }

        res.status(200).json(users);
    } catch (error) {
        console.error('List users error:', error);
        res.status(500).json({ message: 'Server error retrieving user list.' });
    }
};

export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        // 1. Find user by email
        const user = await UserModel.findUserByEmail(email);
        if (!user) {
            // Use a generic message for security
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // 2. Compare the provided password with the stored hash
        const isMatch = await UserModel.comparePassword(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // 3. Success: Send a success response.
        // NOTE: Need to generate and return a JWT here.----------------
        res.status(200).json({ 
            message: 'Login successful!', 
            id: user.id, 
            email: user.email 
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};

// GET /api/users/:id
export const getUser = async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.id);
        if (isNaN(userId)) {
            return res.status(400).json({ message: 'Invalid User ID.' });
        }
        
        const user = await UserModel.findUserById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        
        res.status(200).json(user);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Server error retrieving user.' });
    }
};

// PUT /api/users/:id
export const updateUserDetails = async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.id);
        const { email, password } = req.body;

        if (isNaN(userId) || !email) {
            return res.status(400).json({ message: 'Invalid User ID or missing email.' });
        }

        const updatedUser = await UserModel.updateUser(userId, email, password);

        if (!updatedUser) {
             return res.status(404).json({ message: 'User not found or nothing to update.' });
        }
        
        res.status(200).json({ message: 'User updated successfully.', user: updatedUser });

    } catch (error) {
        console.error('Update user error:', error);
        // Handle unique email constraint violation error
        // if (error.code === '23505') { 
        if (typeof error === 'object' && error !== null && 'code' in error && (error as { code?: string }).code === '23505') {
            return res.status(409).json({ message: 'Email already in use.' });
        }
        res.status(500).json({ message: 'Server error updating user.' });
    }
};

// DELETE /api/users/:id
export const deleteUserAccount = async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.id);
        if (isNaN(userId)) {
            return res.status(400).json({ message: 'Invalid User ID.' });
        }

        const deletedUser = await UserModel.deleteUser(userId);

        if (!deletedUser) {
             return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({ message: 'User deleted successfully.', deleted: deletedUser });

    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Server error deleting user.' });
    }
};