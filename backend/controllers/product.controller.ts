import { Request, Response } from 'express';
import * as ProductModel from '../models/product.model.js';

// POST /api/products
export const create = async (req: Request, res: Response) => {
    try {
        const { name, image, price, category_id } = req.body;
        if (!name || !price || !category_id) {
            return res.status(400).json({ message: 'Name, price, and category_id are required.' });
        }
        
        const newProduct = await ProductModel.createProduct(name, image || '', price, category_id);
        res.status(201).json({ message: 'Product created successfully.', data: newProduct });

    } catch (error) {
        console.error('Create product error:', error);
        // Handle Foreign Key violation (category_id does not exist)
        // if (error.code === '23503') { 
        if (typeof error === 'object' && error !== null && 'code' in error && (error as { code?: string }).code === '23505') {
            return res.status(400).json({ message: 'Invalid category ID provided.' });
        }
        res.status(500).json({ message: 'Server error creating product.' });
    }
};

// GET /api/products/:id
export const getById = async (req: Request, res: Response) => {
    try {
        const productId = parseInt(req.params.id);
        if (isNaN(productId)) {
            return res.status(400).json({ message: 'Invalid Product ID.' });
        }

        const product = await ProductModel.findProductById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        res.status(200).json(product);
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ message: 'Server error retrieving product.' });
    }
};


// GET /api/products?page=...&limit=...&sortBy=...&search=...
export const listProducts = async (req: Request, res: Response) => {
    try {

        const page = parseInt(req.query.page as string || '1');
        const limit = parseInt(req.query.limit as string || '10');
        const sortBy = req.query.sortBy as string || 'created_at';
        const sortOrder = req.query.sortOrder as string || 'DESC';
        const categoryName = req.query.category as string | undefined;
        const productName = req.query.search as string | undefined;

        const data = await ProductModel.findProducts(
            page, 
            limit, 
            sortBy, 
            sortOrder, 
            categoryName, 
            productName
        );

        res.status(200).json(data);
    } catch (error) {
        console.error('List products error:', error);
        res.status(500).json({ message: 'Server error retrieving product list.' });
    }
};

// PUT /api/products/:id
export const update = async (req: Request, res: Response) => {
    try {
        const productId = parseInt(req.params.id);
        const { name, image, price, category_id } = req.body;

        if (isNaN(productId) || !name || !price || !category_id) {
            return res.status(400).json({ message: 'Invalid Product ID or missing required fields (name, price, category_id).' });
        }

        const updatedProduct = await ProductModel.updateProduct(productId, name, image || '', price, category_id);

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        res.status(200).json({ message: 'Product updated successfully.', data: updatedProduct });

    } catch (error) {
        console.error('Update product error:', error);
        // if (error.code === '23503') { 
        if (typeof error === 'object' && error !== null && 'code' in error && (error as { code?: string }).code === '23505') {
            return res.status(400).json({ message: 'Invalid category ID provided.' });
        }
        res.status(500).json({ message: 'Server error updating product.' });
    }
};

// DELETE /api/products/:id
export const remove = async (req: Request, res: Response) => {
    try {
        const productId = parseInt(req.params.id);
        if (isNaN(productId)) {
            return res.status(400).json({ message: 'Invalid Product ID.' });
        }

        const deletedProduct = await ProductModel.deleteProduct(productId);

        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        res.status(200).json({ 
            message: 'Product deleted successfully.', 
            deleted: deletedProduct 
        });

    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ message: 'Server error deleting product.' });
    }
};
