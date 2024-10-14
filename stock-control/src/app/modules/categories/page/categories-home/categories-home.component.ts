import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subject, takeUntil } from 'rxjs';
import { DeleteCategoryAction } from 'src/app/models/interfaces/categories/event/DeleteCategoryAction';
import { GetCategoriesResponse } from 'src/app/models/interfaces/categories/responses/GetCategoriesResponse';
import { EventAction } from 'src/app/models/interfaces/products/event/EventAction';
import { CategoriesService } from 'src/app/services/categories/categories.service';
import { CategoryFormComponent } from '../../components/category-form/category-form.component';

@Component({
  selector: 'app-categories-home',
  templateUrl: './categories-home.component.html',
  styleUrls: [],
})
export class CategoriesHomeComponent implements OnInit, OnDestroy {
  private readonly destroy$: Subject<void> = new Subject();
  private ref!: DynamicDialogRef;
  public categoriesDatas: Array<GetCategoriesResponse> = [];

  constructor(
    private categoriesSevice: CategoriesService,
    private dialogService: DialogService,
    private messageService: MessageService,
    private confirmationSevice: ConfirmationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getAllCategories();
  }

  getAllCategories() {
    this.categoriesSevice
      .getAllCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.length > 0) {
            this.categoriesDatas = response;
          }
        },
        error: (err) => {
          console.log(err);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao buscar categoria',
            life: 2500,
          });
          this.router.navigate(['/dashboard']);
        },
      });
  }

  handleDeleteCategoryAction(event: DeleteCategoryAction): void {
    if (event) {
      this.confirmationSevice.confirm({
        message: `Confirma a exclusao da categoria ${event.categoryName}?`,
        header: 'Confirmacao de Exxclusao',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'sim',
        rejectLabel: 'nao',
        accept: () => this.deleteCategory(event?.category_id),
      });
    }
  }

  deleteCategory(category_id: string): void {
    if (category_id) {
      this.categoriesSevice
        .deleteCategory({ category_id })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.getAllCategories();
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Categoria removida com sucesso!',
              life: 3000,
            });
          },
          error: (err) => {
            console.log(err);
            this.getAllCategories();
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao remover categoria!',
              life: 3000,
            });
          },
        });

      this.getAllCategories();
    }
  }

  handleCategoryAction(event: EventAction): void {
    if (event) {
      this.ref = this.dialogService.open(CategoryFormComponent, {
        header: event?.action,
        width: '70%',
        contentStyle: { overflow: 'auto' },
        baseZIndex: 10000,
        maximizable: true,
        data: {
          event: event,
        },
      });

      this.ref.onClose.pipe(takeUntil(this.destroy$)).subscribe({
        next: () => this.getAllCategories(),
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
