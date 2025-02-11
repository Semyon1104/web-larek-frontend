import { IEvents } from '../components/base/events';

export interface IView {
  render(data?: object): HTMLElement;
}

export class BasketItemView implements IView {
  protected title: HTMLSpanElement;
  protected addButton: HTMLButtonElement;
  protected removeButton: HTMLButtonElement;
  protected id: string | null = null;

  constructor(protected container: HTMLElement, protected events: IEvents) {
    // Предполагается, что в контейнере есть элементы с такими классами:
    this.title = container.querySelector('.basket-item_title') as HTMLSpanElement;
    this.addButton = container.querySelector('.basket-item_add') as HTMLButtonElement;
    this.removeButton = container.querySelector('.basket-item_remove') as HTMLButtonElement;

    this.addButton.addEventListener('click', () => {
      if (this.id) {
        this.events.emit('ui:basket-add', { id: this.id });
      }
    });

    this.removeButton.addEventListener('click', () => {
      if (this.id) {
        this.events.emit('ui:basket-remove', { id: this.id });
      }
    });
  }

  render(data: { id: string; title: string }): HTMLElement {
    if (data) {
      this.id = data.id;
      this.title.textContent = data.title;
    }
    return this.container;
  }
}
