import { ensureElement } from "../../utils/utils";
import { Component } from "../base/Component";
import { IEvents } from "../base/events";

interface IFormState {
  isValid: boolean;
  errorMessages: string[];
}

export class Form<T> extends Component<IFormState> {
  protected submitButton: HTMLButtonElement;
  protected errorContainer: HTMLElement;

  constructor(protected container: HTMLFormElement, protected eventBus: IEvents) {
      super(container);

      this.submitButton = ensureElement<HTMLButtonElement>('button[type=submit]', this.container);
      this.errorContainer = ensureElement<HTMLElement>('.form__errors', this.container);

      this.container.addEventListener('input', this.handleInputChange.bind(this));
      this.container.addEventListener('submit', this.handleFormSubmit.bind(this));
  }

  private handleInputChange(event: Event) {
      const target = event.target as HTMLInputElement;
      if (target && target.name) {
          const fieldName = target.name as keyof T;
          const fieldValue = target.value;
          this.emitFieldChange(fieldName, fieldValue);
      }
  }

  private handleFormSubmit(event: Event) {
      event.preventDefault();
      this.eventBus.emit(`${this.container.name}:submit`);
  }

  private emitFieldChange(field: keyof T, value: string) {
      this.eventBus.emit(`${this.container.name}.${String(field)}:change`, { field, value });
  }

  set isValid(value: boolean) {
      this.submitButton.disabled = !value;
  }

  set errorMessages(value: string) {
      this.updateTextContent(this.errorContainer, value);
  }

  render(state: Partial<T> & IFormState): HTMLElement {
      const { isValid, errorMessages, ...inputValues } = state;
      super.render({ isValid, errorMessages });
      Object.assign(this, inputValues);
      return this.container;
  }
}
