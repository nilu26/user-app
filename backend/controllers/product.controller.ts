import { Request, Response } from "express";
import * as ProductModel from "../models/product.model.js";
import * as CategoryModel from "../models/category.model.js";
import fs from "fs";
import csv from "csv-parser";
import ExcelJS from "exceljs";

// POST /api/products
export const create = async (req: Request, res: Response) => {
  try {
    const { name, image, price, category_id } = req.body;
    if (!name || !price || !category_id) {
      return res
        .status(400)
        .json({ message: "Name, price, and category_id are required." });
    }

    const newProduct = await ProductModel.createProduct(
      name,
      image || "",
      price,
      category_id
    );
    res
      .status(201)
      .json({ message: "Product created successfully.", data: newProduct });
  } catch (error) {
    console.error("Create product error:", error);
    // Handle Foreign Key violation (category_id does not exist)
    // if (error.code === '23503') {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "23505"
    ) {
      return res.status(400).json({ message: "Invalid category ID provided." });
    }
    res.status(500).json({ message: "Server error creating product." });
  }
};

// GET /api/products/:id
export const getById = async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.id);
    if (isNaN(productId)) {
      return res.status(400).json({ message: "Invalid Product ID." });
    }

    const product = await ProductModel.findProductById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({ message: "Server error retrieving product." });
  }
};

// GET /api/products?page=...&limit=...&sortBy=...&search=...
export const listProducts = async (req: Request, res: Response) => {
  try {
    const page = parseInt((req.query.page as string) || "1");
    const limit = parseInt((req.query.limit as string) || "10");
    const sortBy = (req.query.sortBy as string) || "created_at";
    const sortOrder = (req.query.sortOrder as string) || "DESC";
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
    console.error("List products error:", error);
    res.status(500).json({ message: "Server error retrieving product list." });
  }
};

// PUT /api/products/:id
export const update = async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.id);
    const { name, image, price, category_id } = req.body;

    if (isNaN(productId) || !name || !price || !category_id) {
      return res
        .status(400)
        .json({
          message:
            "Invalid Product ID or missing required fields (name, price, category_id).",
        });
    }

    const updatedProduct = await ProductModel.updateProduct(
      productId,
      name,
      image || "",
      price,
      category_id
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found." });
    }

    res
      .status(200)
      .json({ message: "Product updated successfully.", data: updatedProduct });
  } catch (error) {
    console.error("Update product error:", error);
    // if (error.code === '23503') {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "23505"
    ) {
      return res.status(400).json({ message: "Invalid category ID provided." });
    }
    res.status(500).json({ message: "Server error updating product." });
  }
};

// DELETE /api/products/:id
export const remove = async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.id);
    if (isNaN(productId)) {
      return res.status(400).json({ message: "Invalid Product ID." });
    }

    const deletedProduct = await ProductModel.deleteProduct(productId);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found." });
    }

    res.status(200).json({
      message: "Product deleted successfully.",
      deleted: deletedProduct,
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: "Server error deleting product." });
  }
};

// Cache to store category name-to-ID mapping to reduce repeated DB lookups
const categoryCache = new Map<string, number>();

// Finds category ID or returns undefined/null if not found
const getCategoryIdByName = async (
  categoryName: string
): Promise<number | undefined> => {
  const standardizedName = categoryName.trim().toLowerCase();

  if (categoryCache.has(standardizedName)) {
    return categoryCache.get(standardizedName);
  }

  // Find all categories (or just fetch the needed one)
  const allCategories = await CategoryModel.findAllCategories();

  for (const cat of allCategories) {
    const catStandardized = cat.name.trim().toLowerCase();
    categoryCache.set(catStandardized, cat.id);
  }

  // Check cache again after filling it
  return categoryCache.get(standardizedName);
};

// backend/controllers/product.controller.ts (Add imports)

// ... other functions

// POST /api/products/bulk-upload
export const bulkUpload = async (req: Request, res: Response) => {
  // 1. Check for uploaded file from multer
  if (!req.file) {
    return res
      .status(400)
      .json({ message: "No file uploaded. Please upload a CSV file." });
  }

  const filePath = req.file.path;
  let productsToInsert: any[] = [];
  let insertedCount = 0;
  const batchSize = 1000; // Optimal batch size for PostgreSQL is typically 500-1000 rows

  try {
    // 2. Stream the file processing to prevent 504 timeout and memory issues
    const parser = fs.createReadStream(filePath).pipe(csv());

    // Stream listener
    for await (const row of parser) {
      const categoryId = await getCategoryIdByName(
        row.category_name || row.category
      );

      if (!categoryId) {
        // Skip row if category doesn't exist, or handle error
        console.warn(
          `Skipping row: Category "${row.category_name}" not found.`
        );
        continue;
      }

      productsToInsert.push({
        name: row.name,
        image: row.image || "",
        price: parseFloat(row.price),
        category_id: categoryId,
      });

      // 3. Insert products in batches
      if (productsToInsert.length >= batchSize) {
        const count = await ProductModel.insertBatchProducts(productsToInsert);
        insertedCount += count ?? 0;
        productsToInsert = []; // Clear the batch array
      }
    }

    // 4. Insert any remaining products (final batch)
    if (productsToInsert.length > 0) {
      const count = await ProductModel.insertBatchProducts(productsToInsert);
      insertedCount += count ?? 0;
    }

    // 5. Cleanup the uploaded file
    fs.unlinkSync(filePath);

    res.status(200).json({
      message: `Bulk upload successful. Total products inserted: ${insertedCount}.`,
      count: insertedCount,
    });
  } catch (error) {
    console.error("Bulk upload error:", error);
    // Ensure file is deleted even on error
    fs.unlinkSync(filePath);
    res
      .status(500)
      .json({ message: "Server error during bulk upload processing." });
  }
};

export const generateReport = async (req: Request, res: Response) => {
  try {
    // 1. Fetch all data needed for the report
    const products = await ProductModel.findAllProductsForReport();

    // 2. Initialize Workbook and Worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Product Report");

    // 3. Define Columns (Headers)
    worksheet.columns = [
      { header: "ID", key: "unique_id", width: 35 },
      { header: "Product Name", key: "name", width: 40 },
      { header: "Category", key: "category_name", width: 25 },
      {
        header: "Price",
        key: "price",
        width: 15,
        style: { numFmt: '"$"#,##0.00' },
      },
      { header: "Image URL", key: "image", width: 50 },
      { header: "Created Date", key: "created_at", width: 20 },
    ];

    // 4. Add Rows (Streaming the data into the sheet)
    worksheet.addRows(products);

    // 5. Configure Response Headers for File Download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Product_Report_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`
    );

    // 6. Stream the Workbook to the Response
    // This is key to avoiding timeouts for large files!
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Report generation error:", error);
    res.status(500).json({ message: "Server error during report generation." });
  }
};
