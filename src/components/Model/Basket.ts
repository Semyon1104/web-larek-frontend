import { createElement, ensureElement, formatNumber } from "../../utils/utils";
import { Component } from "../base/Component";
import { EventEmitter } from "../base/events";

interface IBasket {
  items: HTMLElement[];
  total: number;
}

export class Basket extends Component<IBasket> {
  protected itemList: HTMLElement;
  protected totalPrice: HTMLElement;
  actionButton: HTMLElement;

  constructor(container: HTMLElement, protected eventEmitter: EventEmitter) {
    super(container);

    this.itemList = ensureElement<HTMLElement>('.basket__list', this.container);
    this.totalPrice = ensureElement<HTMLElement>('.basket__price', this.container);
    this.actionButton = ensureElement<HTMLElement>('.basket__button', this.container);

    this.actionButton.addEventListener('click', () => {
      this.eventEmitter.emit('order:open');
    });

    this.items = [];
  }

  set items(elements: HTMLElement[]) {
    this.itemList.replaceChildren(
      ...(elements.length ? elements : [this.createEmptyMessage()])
    );
  }

  set total(amount: number) {
    this.updateTextContent(this.totalPrice, `${amount} синапсов`);
  }

  private createEmptyMessage(): HTMLElement {
    return createElement<HTMLParagraphElement>('p', { textContent: 'Корзина пуста' });
  }
}
