import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../shared/api.service';

@Component({
  selector: 'app-bulk-upload',
  templateUrl: './bulk-upload.component.html',
  styleUrls: ['./bulk-upload.component.css'],
})
export class BulkUploadComponent implements OnInit {
  selectedFile: File | null = null;
  uploadStatus: string = '';
  isLoading: boolean = false;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {}

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file && file.type === 'text/csv') {
      this.selectedFile = file;
      this.uploadStatus = `File selected: ${file.name}`;
    } else {
      this.selectedFile = null;
      this.uploadStatus = 'Please select a valid CSV file.';
      alert('Only CSV files are allowed for bulk upload.');
    }
  }

  onUpload(): void {
    if (!this.selectedFile) {
      alert('No file selected.');
      return;
    }

    this.isLoading = true;
    this.uploadStatus = 'Uploading and processing... This may take a moment.';

    const formData = new FormData();
    formData.append('file', this.selectedFile, this.selectedFile.name);

    this.apiService.uploadProducts(formData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.uploadStatus = response.message;
        alert(response.message);
        this.resetForm();
      },
      error: (err) => {
        this.isLoading = false;
        const errorMessage =
          err.error?.message || 'Upload failed due to server error.';
        this.uploadStatus = `Error: ${errorMessage}`;
        console.error('Upload Error:', err);
        alert(errorMessage);
      },
    });
  }


  resetForm(): void {
    this.selectedFile = null;
    this.isLoading = false;
  }
}
