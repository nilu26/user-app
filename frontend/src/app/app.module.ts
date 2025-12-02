import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http'; // <-- Import this
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // <-- Good practice for forms

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductFormComponent } from './components/product-form/product-form.component';
import { BulkUploadComponent } from './components/bulk-upload/bulk-upload.component';
import { CategoryManagementComponent } from './components/category-management/category-management.component';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { UserRegistrationComponent } from './components/user-registration/user-registration.component';

@NgModule({
  declarations: [
    AppComponent,
    ProductListComponent,
    ProductFormComponent,
    BulkUploadComponent,
    CategoryManagementComponent,
    UserManagementComponent,
    UserRegistrationComponent,
    // ... other components
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
