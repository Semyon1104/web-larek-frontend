// src/views/BasketView.ts

import { IView } from './BasketItemView';

export class BasketView implements IView {
  constructor(protected container: HTMLElement) {}

  render(data: { items: HTMLElement[] }): HTMLElement {
    if (data) {
      this.container.replaceChildren(...data.items);
    }
    return this.container;
  }
}
