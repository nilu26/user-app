import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductListComponent } from './components/product-list/product-list.component'; // <-- Import
import { BulkUploadComponent } from './components/bulk-upload/bulk-upload.component';
import { CategoryManagementComponent } from './components/category-management/category-management.component';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { UserRegistrationComponent } from './components/user-registration/user-registration.component';

const routes: Routes = [
  { path: 'products', component: ProductListComponent },
  { path: 'bulk-upload', component: BulkUploadComponent },
  { path: 'categories', component: CategoryManagementComponent },
  { path: 'users', component: UserManagementComponent },
  { path: 'register-user', component: UserRegistrationComponent },
  { path: '', redirectTo: '/products', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
