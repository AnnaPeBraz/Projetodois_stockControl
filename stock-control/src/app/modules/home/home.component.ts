import { Response } from 'express';
import { UserService } from './../../services/user/user.service';
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { SignupUserRequest } from 'src/app/models/interfaces/user/SignupUserRequest';
import { AuthRequest } from 'src/app/models/interfaces/user/auth/AuthRequest';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
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
    private messageService: MessageService
  ) {}

  onSubmitLoginForm(): void {
    if (this.loginForm.value && this.loginForm.valid) {
      this.UserService.authUser(this.loginForm.value as AuthRequest).subscribe({
        next: (response) => {
          if (response) {
            this.cookieService.set('USER_INFO', response?.token);
            this.loginForm.reset();
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
      this.UserService.signupUser(
        this.signupForm.value as SignupUserRequest
      ).subscribe({
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
}
