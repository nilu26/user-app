import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../shared/api.service';

@Component({
  selector: 'app-user-registration',
  templateUrl: './user-registration.component.html',
  styleUrls: ['./user-registration.component.css'],
})
export class UserRegistrationComponent implements OnInit {
  registrationForm!: FormGroup;

  constructor(private fb: FormBuilder, private apiService: ApiService) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.registrationForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  onSubmit(): void {
    if (this.registrationForm.invalid) {
      alert(
        'Please check your input. Email is required and valid; password needs at least 8 characters.'
      );
      return;
    }

    const { email, password } = this.registrationForm.value;

    this.apiService.registerUser({ email, password }).subscribe({
      next: (response) => {
        alert(
          `User created successfully! ID: ${response.id}, Email: ${response.email}`
        );
        this.registrationForm.reset();
      },
      error: (err) => {
        const errorMessage =
          err.error?.message || 'Registration failed due to server error.';
        alert(`Registration Error: ${errorMessage}`);
        console.error('Registration failed:', err);
      },
    });
  }
}
