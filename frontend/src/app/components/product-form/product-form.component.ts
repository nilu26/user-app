import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../shared/api.service';
import { Category, Product } from '../../shared/interfaces';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css'],
})
export class ProductFormComponent implements OnInit {
  @Input() productToEdit: Product | null = null;
  @Output() formSubmitted = new EventEmitter<boolean>();

  productForm!: FormGroup;
  categories: Category[] = [];
  isEditMode: boolean = false;

  constructor(private fb: FormBuilder, private apiService: ApiService) {}

  ngOnInit(): void {
    this.isEditMode = !!this.productToEdit;
    this.loadCategories();
    this.initForm();
  }

  loadCategories(): void {
    this.apiService.getCategories().subscribe((data) => {
      this.categories = data;
    });
  }

  initForm(): void {
    this.productForm = this.fb.group({
      name: [this.productToEdit?.name || '', Validators.required],
      price: [
        this.productToEdit?.price || null,
        [Validators.required, Validators.min(0.01)],
      ],
      image: [this.productToEdit?.image || ''],
      category_id: [this.productToEdit?.category_id || '', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      alert('Please fill out all required fields.');
      return;
    }

    const formData = this.productForm.value;

    if (this.isEditMode && this.productToEdit) {
      // UPDATE existing product
      this.apiService.updateProduct(this.productToEdit.id, formData).subscribe({
        next: () => {
          alert('Product updated successfully!');
          this.formSubmitted.emit(true);
        },
        error: (err) => console.error('Update failed:', err),
      });
    } else {
      // CREATE new product
      this.apiService.createProduct(formData).subscribe({
        next: () => {
          alert('Product created successfully!');
          this.productForm.reset();
          this.formSubmitted.emit(true);
        },
        error: (err) => console.error('Creation failed:', err),
      });
    }
  }
}
