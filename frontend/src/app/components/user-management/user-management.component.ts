import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../shared/api.service';
import { User } from '../../shared/interfaces';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.apiService.getUsers().subscribe((data) => {
      this.users = data;
    });
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete user: ${user.email}?`)) {
      this.apiService.deleteUser(user.id).subscribe({
        next: () => {
          alert('User deleted successfully.');
          this.loadUsers();
        },
        error: (err) => console.error('Deletion failed:', err),
      });
    }
  }
}
