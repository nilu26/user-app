import { Router } from 'express';
import { 
    registerUser,
    loginUser,
    getUser,
    updateUserDetails,
    deleteUserAccount,
    listAllUsers
} from '../controllers/user.controller.js';

const router = Router();

// LIST ALL USERS endpoint
router.get('/', listAllUsers); // GET /api/users

// Registration endpoint: POST /api/users/register
router.post('/register', registerUser);

// Login endpoint: POST /api/users/login
router.post('/login', loginUser);

// CRUD Routes for a specific user (using ID parameter)
router.get('/:id', getUser);             // GET user by ID
router.put('/:id', updateUserDetails);   // UPDATE user by ID
router.delete('/:id', deleteUserAccount);   // DELETE user by ID

export default router;