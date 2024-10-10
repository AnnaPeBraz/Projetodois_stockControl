import { Response } from 'express';
import { GetCategoriesResponse } from './../../../../models/interfaces/categories/responses/GetCategoriesResponse';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { CategoriesService } from 'src/app/services/categories/categories.service';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: [],
})
export class ProductFormComponent implements OnInit, OnDestroy {
  private readonly destroy$: Subject<void> = new Subject();
  public categoriesData: Array<GetCategoriesResponse> = [];
  public selectedCategory: Array<{name:string, code:string}> = []
  public addProductForm = this.formBuilder.group({
    name:['', Validators.required],
    price: ['', Validators.required],
    description: ['', Validators.required],
    category_id: ['', Validators.required],
    amount: [0, Validators.required],
  });

  constructor(
    private categoriesServices: CategoriesService,
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private router: Router,
  ){};

  ngOnInit(): void {
    this.getAllCategories();
  }

  getAllCategories(): void {
    this.categoriesServices.getAllCategories()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) => {
        if (response.length > 0) {
          this.categoriesData = response;
        }
      },
    });
  }

  handleSubmitAddProduct(): void{};

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
