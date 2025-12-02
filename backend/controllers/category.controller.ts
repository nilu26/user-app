import { Request, Response } from 'express';
import * as CategoryModel from '../models/category.model.js';

// POST /api/categories
export const create = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Category name is required.' });
        }
        
        const newCategory = await CategoryModel.createCategory(name);
        res.status(201).json({ message: 'Category created successfully.', data: newCategory });

    } catch (error) {
        console.error('Create category error:', error);
        // Handle unique constraint violation error (if name already exists)
        // if (error.code === '23505') { 
        if (typeof error === 'object' && error !== null && 'code' in error && (error as { code?: string }).code === '23505') {
            return res.status(409).json({ message: 'Category name already exists.' });
        }
        res.status(500).json({ message: 'Server error creating category.' });
    }
};

// GET /api/categories
export const list = async (req: Request, res: Response) => {
    try {
        const categories = await CategoryModel.findAllCategories();
        res.status(200).json(categories);
    } catch (error) {
        console.error('List categories error:', error);
        res.status(500).json({ message: 'Server error retrieving categories.' });
    }
};

// GET /api/categories/:id
export const getById = async (req: Request, res: Response) => {
    try {
        const categoryId = parseInt(req.params.id);
        if (isNaN(categoryId)) {
            return res.status(400).json({ message: 'Invalid Category ID.' });
        }

        const category = await CategoryModel.findCategoryById(categoryId);
        if (!category) {
            return res.status(404).json({ message: 'Category not found.' });
        }

        res.status(200).json(category);
    } catch (error) {
        console.error('Get category error:', error);
        res.status(500).json({ message: 'Server error retrieving category.' });
    }
};

// PUT /api/categories/:id
export const update = async (req: Request, res: Response) => {
    try {
        const categoryId = parseInt(req.params.id);
        const { name } = req.body;

        if (isNaN(categoryId) || !name) {
            return res.status(400).json({ message: 'Invalid Category ID or missing name.' });
        }

        const updatedCategory = await CategoryModel.updateCategory(categoryId, name);

        if (!updatedCategory) {
            return res.status(404).json({ message: 'Category not found.' });
        }

        res.status(200).json({ message: 'Category updated successfully.', data: updatedCategory });

    } catch (error) {
        console.error('Update category error:', error);
        // if (error.code === '23505') { 
        if (typeof error === 'object' && error !== null && 'code' in error && (error as { code?: string }).code === '23505') {
            return res.status(409).json({ message: 'Category name already exists.' });
        }
        res.status(500).json({ message: 'Server error updating category.' });
    }
};

// DELETE /api/categories/:id
export const remove = async (req: Request, res: Response) => {
    try {
        const categoryId = parseInt(req.params.id);
        if (isNaN(categoryId)) {
            return res.status(400).json({ message: 'Invalid Category ID.' });
        }

        const deletedCategory = await CategoryModel.deleteCategory(categoryId);

        if (!deletedCategory) {
            return res.status(404).json({ message: 'Category not found.' });
        }

        res.status(200).json({ 
            message: 'Category deleted successfully.', 
            deleted: deletedCategory 
        });

    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ message: 'Server error deleting category.' });
    }
};