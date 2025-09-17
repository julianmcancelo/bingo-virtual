import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {
  loginForm: FormGroup;
  registerForm: FormGroup;
  isLoginMode = true;
  isLoading = false;
  currentYear = new Date().getFullYear();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm = this.fb.group({
      nombre_usuario: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {}

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (!password || !confirmPassword) {
      return null;
    }
    
    return password.value === confirmPassword.value ? null : { mismatch: true };
  }

  onSwitchMode() {
    this.isLoginMode = !this.isLoginMode;
    // Reset form validation when switching modes
    if (this.isLoginMode) {
      this.registerForm.reset();
    } else {
      this.loginForm.reset();
    }
  }

  onSubmit() {
    if (this.isLoginMode) {
      this.onLogin();
    } else {
      this.onRegister();
    }
  }

  private onLogin(): void {
    if (this.loginForm.invalid) {
      Object.values(this.loginForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }

    const { email, password } = this.loginForm.value;
    this.isLoading = true;

    this.authService.login(email, password).subscribe({
      next: () => {
        this.router.navigate(['/bingo']);
      },
      error: (error: any) => {
        console.error('Login error:', error);
        let errorMessage = 'Credenciales inválidas. Por favor, inténtalo de nuevo.';
        
        if (error?.error?.message) {
          errorMessage = error.error.message;
        } else if (error?.error?.error) {
          errorMessage = error.error.error;
        }
        
        Swal.fire({
          title: 'Error',
          text: errorMessage,
          icon: 'error',
          confirmButtonColor: '#3b82f6'
        });
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  private onRegister(): void {
    if (this.registerForm.invalid) {
      Object.values(this.registerForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }

    // Check password match
    if (this.registerForm.hasError('mismatch')) {
      Swal.fire({
        title: 'Error',
        text: 'Las contraseñas no coinciden',
        icon: 'error',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    const { nombre_usuario, email, password } = this.registerForm.value;
    this.isLoading = true;

    this.authService.register(
      nombre_usuario, 
      email, 
      password, 
      this.registerForm.get('confirmPassword')?.value || ''
    ).subscribe({
      next: () => {
        Swal.fire({
          title: '¡Registro exitoso!',
          text: 'Tu cuenta ha sido creada correctamente. Por favor inicia sesión.',
          icon: 'success',
          confirmButtonColor: '#3b82f6'
        });
        this.isLoginMode = true;
        this.registerForm.reset();
      },
      error: (error: any) => {
        console.error('Registration error:', error);
        let errorMessage = 'No se pudo completar el registro. Por favor, inténtalo de nuevo.';
        
        if (error?.error?.message) {
          errorMessage = error.error.message;
        } else if (error?.error?.error) {
          errorMessage = error.error.error;
        } else if (error.status === 0) {
          errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
        }
        
        Swal.fire({
          title: 'Error',
          text: errorMessage,
          icon: 'error',
          confirmButtonColor: '#3b82f6'
        });
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}
