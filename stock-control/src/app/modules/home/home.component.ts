import { Response } from 'express';
import { UserService } from './../../services/user/user.service';
import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { SignupUserRequest } from 'src/app/models/interfaces/user/SignupUserRequest';
import { AuthRequest } from 'src/app/models/interfaces/user/auth/AuthRequest';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnDestroy{
  private destroy$ = new Subject<void>();
  loginCard = true;

  loginForm = this.formBuilder.group({
    email: ['', Validators.required],
    password: ['', Validators.required],
  });

  signupForm = this.formBuilder.group({
    name: ['', Validators.required],
    email: ['', Validators.required],
    password: ['', Validators.required],
  });
  constructor(
    private formBuilder: FormBuilder,
    private UserService: UserService,
    private cookieService: CookieService,
    private messageService: MessageService,
    private router: Router
  ) {}

  onSubmitLoginForm(): void {
    if (this.loginForm.value && this.loginForm.valid) {
      this.UserService.authUser(this.loginForm.value as AuthRequest)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response) {
              this.cookieService.set('USER_INFO', response?.token);
              this.loginForm.reset();
              this.router.navigate(['/dashboard']);
              this.messageService.add({
                severity: 'success',
                summary: 'sucesso',
                detail: `Bem vindo de volta ${response.name}`,
                life: 2000,
              });
            }
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: `Erro ao fazer login`,
              life: 2000,
            });
          },
        });
    }
  }
  onSubmitSignupForm(): void {
    if (this.signupForm.value && this.signupForm.valid) {
      this.UserService.signupUser(this.signupForm.value as SignupUserRequest)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response) {
              this.signupForm.reset();
              this.loginCard = true;
              this.messageService.add({
                severity: 'success',
                summary: 'sucesso',
                detail: `Bem vindo de volta ${response.name}`,
                life: 2000,
              });
            }
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: `Erro ao criar o usuario`,
              life: 2000,
            });
          },
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
