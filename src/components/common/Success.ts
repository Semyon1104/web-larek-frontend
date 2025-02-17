import { ensureElement } from "../../utils/utils";
import { Component } from "../base/Component";

interface ISuccess {
  total: number;
}

interface ISuccessActions {
  onClose: () => void;
}

export class Success extends Component<ISuccess> {
  protected totalDescription: HTMLElement;
  protected closeButton: HTMLElement;

  constructor(container: HTMLElement, actions: ISuccessActions) {
    super(container);

    this.closeButton = ensureElement<HTMLElement>('.order-success__close', container);
    this.totalDescription = ensureElement<HTMLElement>('.order-success__description', container);

    this.attachEventListeners(actions);
  }

  private attachEventListeners(actions: ISuccessActions) {
    if (actions?.onClose) {
      this.closeButton.addEventListener('click', actions.onClose);
    }
  }

  set total(value: string) {
    this.totalDescription.textContent = `Списано ${value} синапсов`;
  }
}
