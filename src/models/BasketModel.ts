import { IEvents } from '../components/base/events';

export interface IBasketModel {
  items: Map<string, number>;
  add(id: string): void;
  remove(id: string): void;
}

export class BasketModel implements IBasketModel {
  public items: Map<string, number> = new Map();

  constructor(protected events: IEvents) {}

  add(id: string): void {
    const count = this.items.get(id) || 0;
    this.items.set(id, count + 1);
    this._changed();
  }

  remove(id: string): void {
    if (this.items.has(id)) {
      this.items.delete(id);
      this._changed();
    }
  }

  protected _changed(): void {
    // Уведомляем подписчиков о том, что корзина изменилась
    this.events.emit('basket:change', { items: Array.from(this.items.keys()) });
  }
}
