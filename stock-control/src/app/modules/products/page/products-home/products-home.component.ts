import { GetAllProductsResponse } from './../../../../models/interfaces/products/response/GetAllProductsResponse';
import { ProductsDataTransferService } from './../../../../shared/services/products/products-data-transfer.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { EventAction } from 'src/app/models/interfaces/products/event/EventAction';
import { ProductsService } from 'src/app/services/products/products.service';

@Component({
  selector: 'app-products-home',
  templateUrl: './products-home.component.html',
  styleUrls: [],
})
export class ProductsHomeComponent implements OnInit, OnDestroy {
  private readonly destroy$: Subject<void> = new Subject();
  public productsDatas: Array<GetAllProductsResponse> = [];

  constructor(
    private productsServices: ProductsService,
    private productsDataService: ProductsDataTransferService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.getServiceProductsDatas();
  }

  getServiceProductsDatas() {
    const productsLoaded = this.productsDataService.getProductsDatas();

    if (productsLoaded.length > 0) {
      this.productsDatas = productsLoaded;
    } else this.getAPIProductsDatas();
  }

  getAPIProductsDatas() {
    this.productsServices
      .getAllProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.length > 0) {
            this.productsDatas = response;
          }
        },
        error: (err) => {
          console.log(err);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao buscar produto',
            life: 2500,
          });
          this.router.navigate(['/dashboard']);
        },
      });
  }

  handleProductAction(event: EventAction): void {
    if (event) {
      console.log('EVENT', event);
    }
  }

  handleDeleteProductAction(event: {
    product_id: string;
    productName: string;
  }): void {
    if (event) {
      this.confirmationService.confirm({
        message: `Confirma a exclusao do produto ${event?.productName}?`,
        header: 'Confirmacao de exclusao',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Sim',
        rejectLabel: 'Nao',
        accept: () => this.deleteProductAction(event?.product_id),
      });
    }
  }
  deleteProductAction(product_id: string) {
    if (product_id) {
      this.productsServices
        .deleteProduct(product_id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response) {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: ' producto removido com sucesso',
                life: 2500,
              });

              this.getAPIProductsDatas();
            }
          },
          error: (err) => {
            console.log(err);
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao remover produto',
              life: 2500,
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
