import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category, Product, ProductListResponse, User } from './interfaces';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  // --- USER API ---
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  // --- CATEGORY API ---
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }

  // --- PRODUCT API ---
  getProducts(params: HttpParams): Observable<ProductListResponse> {
    // HttpParams handles pagination, sorting, and searching query parameters
    return this.http.get<ProductListResponse>(`${this.apiUrl}/products`, {
      params,
    });
  }

  // --- PRODUCT API (CRUD) ---
  createProduct(
    productData: Omit<
      Product,
      'id' | 'unique_id' | 'created_at' | 'category_name'
    >
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/products`, productData);
  }

  updateProduct(id: number, productData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/products/${id}`, productData);
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/products/${id}`);
  }

  // --- BULK UPLOAD & REPORT ---
  uploadProducts(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/products/bulk-upload`, formData);
  }

  downloadReport(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/products/report`, {
      responseType: 'blob',
    });
  }

  // --- CATEGORY API (CRUD) ---
  createCategory(data: { name: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/categories`, data);
  }

  updateCategory(id: number, data: { name: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/categories/${id}`, data);
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/categories/${id}`);
  }

  // --- USER API (Registration) ---
  registerUser(data: {
    email: string;
    password: string;
  }): Observable<{ id: number; email: string }> {
    return this.http.post<{ id: number; email: string }>(
      `${this.apiUrl}/users/register`,
      data
    );
  }
  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}`);
  }
}
