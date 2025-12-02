import query from '../config/db.js';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

// Create a new user (handles password encryption)
export const createUser = async (email: string, passwordPlain: string) => {
    // 1. Encrypt the password
    const passwordHash = await bcrypt.hash(passwordPlain, SALT_ROUNDS);

    // 2. Insert user into DB
    const text = 'INSERT INTO users(email, password) VALUES($1, $2) RETURNING id, email';
    const values = [email, passwordHash];
    
    const res = await query(text, values);
    return res.rows[0];
};

// Find a user by email
export const findUserByEmail = async (email: string) => {
    const text = 'SELECT id, email, password FROM users WHERE email = $1';
    const res = await query(text, [email]);
    return res.rows[0];
};

// Compare the plain text password with the stored hash
export const comparePassword = async (passwordPlain: string, passwordHash: string) => {
    return bcrypt.compare(passwordPlain, passwordHash);
};

export const findUserById = async (id: number) => {
    const text = 'SELECT id, email FROM users WHERE id = $1';
    const res = await query(text, [id]);
    return res.rows[0];
};

// Update user email and optionally password
export const updateUser = async (id: number, email: string, passwordPlain?: string) => {
    let text = 'UPDATE users SET email = $1';
    let values: (string | number)[] = [email];
    let queryIndex = 2;

    if (passwordPlain) {
        const passwordHash = await bcrypt.hash(passwordPlain, SALT_ROUNDS);
        text += `, password = $${queryIndex}`;
        values.push(passwordHash);
        queryIndex++;
    }

    text += ` WHERE id = $${queryIndex} RETURNING id, email`;
    values.push(id);
    
    const res = await query(text, values);
    return res.rows[0];
};

// Delete a user
export const deleteUser = async (id: number) => {
    const text = 'DELETE FROM users WHERE id = $1 RETURNING id, email';
    const res = await query(text, [id]);
    return res.rows[0];
};

export const findAllUsers = async () => {
    const text = 'SELECT id, email, created_at FROM users ORDER BY created_at DESC';
    const res = await query(text);
    return res.rows;
};