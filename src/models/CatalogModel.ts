import { Product } from '../types';

export interface ICatalogModel {
  items: Product[];
  setItems(items: Product[]): void;
  getProduct(id: string): Product | undefined;
}

export class CatalogModel implements ICatalogModel {
  items: Product[] = [];

  setItems(items: Product[]): void {
    this.items = items;
  }

  getProduct(id: string): Product | undefined {
    return this.items.find(product => product.id === id);
  }
}
