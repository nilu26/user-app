import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../shared/api.service';
import { HttpParams } from '@angular/common/http';
import { Product, ProductListResponse } from '../../shared/interfaces';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  productListResponse!: ProductListResponse;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  sortBy: string = 'created_at';
  sortOrder: string = 'DESC';

  searchForm: FormGroup;

  isFormVisible: boolean = false;
  selectedProduct: Product | null = null;

  constructor(private apiService: ApiService, private fb: FormBuilder) {
    this.searchForm = this.fb.group({
      search: [''], 
      category: [''], 
    });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    let params = new HttpParams()
      .set('page', this.currentPage.toString())
      .set('limit', this.itemsPerPage.toString())
      .set('sortBy', this.sortBy)
      .set('sortOrder', this.sortOrder);


    const searchVal = this.searchForm.get('search')?.value;
    const categoryVal = this.searchForm.get('category')?.value;

    if (searchVal) {
      params = params.set('search', searchVal);
    }
    if (categoryVal) {
      params = params.set('category', categoryVal);
    }

    this.apiService.getProducts(params).subscribe({
      next: (response) => {
        this.products = response.products;
        this.productListResponse = response;
      },
      error: (err) => {
        console.error('Failed to load products:', err);
      },
    });
  }

  showCreateForm(): void {
    this.selectedProduct = null;
    this.isFormVisible = true;
  }

  showEditForm(product: Product): void {
    this.selectedProduct = product;
    this.isFormVisible = true;
  }

  handleFormSubmit(refresh: boolean): void {
    this.isFormVisible = false;
    this.selectedProduct = null;
    if (refresh) {
      this.loadProducts();
    }
  }

  deleteProduct(id: number, name: string): void {
    if (confirm(`Are you sure you want to delete the product "${name}"?`)) {
      this.apiService.deleteProduct(id).subscribe({
        next: () => {
          alert('Product deleted successfully!');
          this.loadProducts();
        },
        error: (err) => console.error('Deletion failed:', err),
      });
    }
  }

  downloadProductReport(): void {
    this.apiService.downloadReport().subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');

        const filename = `Product_Report_${new Date()
          .toISOString()
          .slice(0, 10)}.xlsx`;

        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();

        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (err) => {
        console.error('Download failed:', err);
        alert('Failed to download report.');
      },
    });
  }

  changePage(newPage: number): void {
    if (newPage >= 1 && newPage <= this.productListResponse.totalPages) {
      this.currentPage = newPage;
      this.loadProducts();
    }
  }

  onSortChange(field: string): void {
    if (this.sortBy === field) {
      this.sortOrder = this.sortOrder === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.sortBy = field;
      this.sortOrder = 'ASC';
    }
    this.loadProducts();
  }

  onSearchSubmit(): void {
    this.currentPage = 1;
    this.loadProducts();
  }
}
