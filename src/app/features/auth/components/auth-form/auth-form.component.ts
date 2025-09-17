import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-auth-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './auth-form.component.html',
  styleUrls: ['./auth-form.component.css']
})
export class AuthFormComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  registerForm: FormGroup;
  isLoginMode = true;
  isLoading = false;
  error: string | null = null;
  currentYear = new Date().getFullYear();
  private routeSub: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm = this.fb.group({
      nombre_usuario: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm_password: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.isLoginMode = data['isLogin'] !== false;
    });
  }

  ngOnDestroy(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
    if (this.isLoginMode) {
      this.loginForm.reset();
    } else {
      this.registerForm.reset();
    }
  }

  private passwordMatchValidator(g: FormGroup): { [key: string]: boolean } | null {
    const password = g.get('password')?.value;
    const confirmPassword = g.get('confirm_password')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  onSwitchMode(): void {
    this.toggleMode();
    const newPath = this.isLoginMode ? '/auth/login' : '/auth/register';
    this.router.navigateByUrl(newPath);
  }

  onSubmit(): void {
    if (this.isLoginMode) {
      this.onLogin();
    } else {
      this.onRegister();
    }
  }

  private onLogin(): void {
    if (this.loginForm.invalid) {
      // Mark all fields as touched to show validation messages
      Object.values(this.loginForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }

    const { email, password } = this.loginForm.value;
    this.isLoading = true;

    this.authService.login(email, password).subscribe({
      next: () => {
        // Navigate to the redirect URL if it exists, otherwise go to /bingo
        const redirectUrl = this.authService.redirectUrl || '/bingo';
        this.authService.redirectUrl = null; // Clear the stored URL
        this.router.navigateByUrl(redirectUrl);
      },
      error: (error: any) => {
        console.error('Login error:', error);
        let errorMessage = 'Credenciales inválidas. Por favor, inténtalo de nuevo.';
        
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.error && error.error.error) {
          errorMessage = error.error.error;
        } else if (error.status === 0) {
          errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
        } else if (error.status === 401) {
          errorMessage = 'Correo electrónico o contraseña incorrectos.';
        }

        Swal.fire({
          title: 'Error',
          text: errorMessage,
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  private onRegister(): void {
    if (this.registerForm.invalid) {
      // Mark all fields as touched to show validation messages
      Object.values(this.registerForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }

    // Check if passwords match
    if (this.registerForm.hasError('mismatch')) {
      Swal.fire({
        title: 'Error',
        text: 'Las contraseñas no coinciden',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    const { nombre_usuario, email, password } = this.registerForm.value;
    this.isLoading = true;

    this.authService.register(
      nombre_usuario, 
      email, 
      password, 
      this.registerForm.value.confirm_password
    ).subscribe({
      next: () => {
        Swal.fire({
          title: '¡Registro exitoso!',
          text: 'Tu cuenta ha sido creada correctamente. Por favor inicia sesión.',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
        // Switch to login mode after successful registration
        this.isLoginMode = true;
        this.registerForm.reset();
      },
      error: (error: any) => {
        console.error('Registration error:', error);
        let errorMessage = 'No se pudo completar el registro. Por favor, inténtalo de nuevo.';
        
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.error && error.error.error) {
          errorMessage = error.error.error;
        } else if (error.status === 0) {
          errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
        }

        Swal.fire({
          title: 'Error',
          text: errorMessage,
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}
