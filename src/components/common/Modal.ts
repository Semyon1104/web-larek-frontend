import { ensureElement } from "../../utils/utils";
import { Component } from "../base/Component";
import { IEvents } from "../base/events";

interface IModalData {
  content: HTMLElement;
}

export class Modal extends Component<IModalData> {
  protected closeButton: HTMLButtonElement;
  protected contentContainer: HTMLElement;

  constructor(container: HTMLElement, protected eventBus: IEvents) {
    super(container);

    this.closeButton = ensureElement<HTMLButtonElement>('.modal__close', container);
    this.contentContainer = ensureElement<HTMLElement>('.modal__content', container);

    this.attachEventListeners();
  }

  private attachEventListeners() {
    this.closeButton.addEventListener('click', () => this.hide());
    this.container.addEventListener('click', () => this.hide());
    this.contentContainer.addEventListener('click', (event) => event.stopPropagation());
  }

  set content(value: HTMLElement) {
    this.contentContainer.replaceChildren(value);
  }

  show() {
    this.container.classList.add('modal_active');
    this.eventBus.emit('modal:open');
  }

  hide() {
    this.container.classList.remove('modal_active');
    this.contentContainer.innerHTML = '';
    this.eventBus.emit('modal:close');
  }

  render(data: IModalData): HTMLElement {
    super.render(data);
    this.show();
    return this.container;
  }
}
