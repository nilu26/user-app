import query from "../config/db.js";

// Base fields to select, including the category name via JOIN
const PRODUCT_FIELDS =
  "p.id, p.unique_id, p.name, p.image, p.price, p.created_at, c.name AS category_name, c.id AS category_id";

// Create a new product
export const createProduct = async (
  name: string,
  image: string,
  price: number,
  category_id: number
) => {
  const text =
    "INSERT INTO products(name, image, price, category_id) VALUES($1, $2, $3, $4) RETURNING id, unique_id";
  const values = [name, image, price, category_id];

  const res = await query(text, values);
  return res.rows[0];
};

// Retrieve a single product by ID
export const findProductById = async (id: number) => {
  const text = `
        SELECT ${PRODUCT_FIELDS} 
        FROM products p 
        JOIN categories c ON p.category_id = c.id 
        WHERE p.id = $1
    `;
  const res = await query(text, [id]);
  return res.rows[0];
};

// Update a product
export const updateProduct = async (
  id: number,
  name: string,
  image: string,
  price: number,
  category_id: number
) => {
  const text = `
        UPDATE products 
        SET name = $1, image = $2, price = $3, category_id = $4 
        WHERE id = $5 
        RETURNING id, unique_id
    `;
  const values = [name, image, price, category_id, id];
  const res = await query(text, values);
  return res.rows[0];
};

// Delete a product
export const deleteProduct = async (id: number) => {
  const text = "DELETE FROM products WHERE id = $1 RETURNING id, name";
  const res = await query(text, [id]);
  return res.rows[0];
};

// Function to handle the complex requirements for the Product List API
export const findProducts = async (
  page: number,
  limit: number,
  sortBy: string,
  sortOrder: string,
  categoryName: string | undefined,
  productName: string | undefined
) => {
  const offset = (page - 1) * limit;

  // Base query selects product fields and joins with category
  let listQuery = `
        SELECT ${PRODUCT_FIELDS} 
        FROM products p 
        JOIN categories c ON p.category_id = c.id
    `;

  let countQuery = `SELECT COUNT(p.id) FROM products p JOIN categories c ON p.category_id = c.id`;

  let whereClauses: string[] = [];
  let queryParams: (string | number)[] = [];
  let paramIndex = 1;

  // 1. Search by Category Name
  if (categoryName) {
    whereClauses.push(`c.name ILIKE $${paramIndex++}`);
    queryParams.push(`%${categoryName}%`);
  }

  // 2. Search by Product Name
  if (productName) {
    whereClauses.push(`p.name ILIKE $${paramIndex++}`);
    queryParams.push(`%${productName}%`);
  }

  // Append WHERE clause if filters exist
  if (whereClauses.length > 0) {
    const whereString = " WHERE " + whereClauses.join(" AND ");
    listQuery += whereString;
    countQuery += whereString;
  }

  // 3. Sorting
  const allowedSortFields = ["price", "name", "created_at"];
  const safeSortBy = allowedSortFields.includes(sortBy)
    ? `p.${sortBy}`
    : "p.created_at";
  const safeSortOrder = sortOrder.toUpperCase() === "DESC" ? "DESC" : "ASC";

  listQuery += ` ORDER BY ${safeSortBy} ${safeSortOrder}`;

  // 4. Pagination (Limit and Offset)
  listQuery += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  queryParams.push(limit, offset);

  // Execute both queries concurrently
  const [listResult, countResult] = await Promise.all([
    query(listQuery, queryParams),
    query(countQuery, queryParams.slice(0, -2)), // Remove limit and offset from count query params
  ]);

  const totalItems = parseInt(countResult.rows[0].count, 10);

  return {
    products: listResult.rows,
    totalItems,
    totalPages: Math.ceil(totalItems / limit),
    currentPage: page,
    itemsPerPage: limit,
  };
};

// Function to handle bulk inserts using a single multi-row INSERT statement
// Takes an array of product objects, formats them, and executes the batch insert.
export const insertBatchProducts = async (products: any[]) => {
  if (products.length === 0) {
    return 0; // Return 0 if no products to insert
  }

  // 1. Prepare multi-row VALUES string ($1, $2, $3, $4), ($5, $6, $7, $8)...
  const placeholders: string[] = [];
  let values: (string | number)[] = [];
  let paramIndex = 1;

  for (const product of products) {
    // Ensure values match the order: name, image, price, category_id
    placeholders.push(
      `($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`
    );
    values.push(
      product.name,
      product.image,
      product.price,
      product.category_id
    );
  }

  const text = `
        INSERT INTO products(name, image, price, category_id) 
        VALUES ${placeholders.join(", ")} 
        RETURNING id
    `;

  const res = await query(text, values);
  return res.rowCount; // Return the number of inserted rows
};

export const findAllProductsForReport = async () => {
  // Note: We use the same JOIN logic as before to get category names
  const text = `
        SELECT p.name, p.image, p.price, c.name AS category_name, p.unique_id, p.created_at
        FROM products p 
        JOIN categories c ON p.category_id = c.id
        ORDER BY p.name ASC
    `;

  const res = await query(text);
  return res.rows;
};
