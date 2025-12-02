import { Router } from 'express';
import * as CategoryController from '../controllers/category.controller.js';

const router = Router();

// List all categories and Create new category
router.route('/')
    .get(CategoryController.list)   // GET /api/categories
    .post(CategoryController.create); // POST /api/categories

// Get, Update, or Delete a specific category by ID
router.route('/:id')
    .get(CategoryController.getById)   // GET /api/categories/:id
    .put(CategoryController.update)    // PUT /api/categories/:id
    .delete(CategoryController.remove); // DELETE /api/categories/:id

export default router;