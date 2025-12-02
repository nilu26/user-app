import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../shared/api.service';
import { Category } from '../../shared/interfaces';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-category-management',
  templateUrl: './category-management.component.html',
  styleUrls: ['./category-management.component.css'],
})
export class CategoryManagementComponent implements OnInit {
  categories: Category[] = [];
  categoryForm!: FormGroup;
  editingCategory: Category | null = null; 

  constructor(private apiService: ApiService, private fb: FormBuilder) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  initForm(category: Category | null = null): void {
    this.editingCategory = category;
    this.categoryForm = this.fb.group({
      name: [category?.name || '', Validators.required],
    });
  }

  loadCategories(): void {
    this.apiService.getCategories().subscribe((data) => {
      this.categories = data;
    });
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) return;

    const name = this.categoryForm.value.name;

    if (this.editingCategory) {
      this.apiService
        .updateCategory(this.editingCategory.id, { name })
        .subscribe({
          next: () => {
            alert('Category updated successfully.');
            this.loadCategories();
            this.initForm();
          },
          error: (err) =>
            alert(`Update failed: ${err.error?.message || 'Server error'}`),
        });
    } else {

      this.apiService.createCategory({ name }).subscribe({
        next: () => {
          alert('Category created successfully.');
          this.loadCategories();
          this.categoryForm.reset();
        },
        error: (err) =>
          alert(`Creation failed: ${err.error?.message || 'Server error'}`),
      });
    }
  }

  deleteCategory(category: Category): void {
    if (
      confirm(
        `Are you sure you want to delete category "${category.name}"? This will delete linked products!`
      )
    ) {
      this.apiService.deleteCategory(category.id).subscribe({
        next: () => {
          alert('Category deleted successfully.');
          this.loadCategories();
        },
        error: (err) =>
          alert(`Deletion failed: ${err.error?.message || 'Server error'}`),
      });
    }
  }
}
