// For User CRUD
export interface User {
  id: number;
  email: string;
  created_at?: string;
}

// For Category CRUD
export interface Category {
  id: number;
  unique_id: string;
  name: string;
  created_at: string;
}

// For Product CRUD
export interface Product {
  id: number;
  unique_id: string;
  name: string;
  image: string;
  price: number;
  category_id: number;
  category_name: string;
  created_at: string;
}

// For Product List API Response 
export interface ProductListResponse {
  products: Product[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
}
