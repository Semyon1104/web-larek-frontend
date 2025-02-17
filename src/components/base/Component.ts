export abstract class Component<T> {
  protected constructor(protected readonly container: HTMLElement) {}

  protected updateClass(element: HTMLElement, className: string, force?: boolean): void {
    element.classList.toggle(className, force);
  }

  setDisabledState(element: HTMLElement, isDisabled: boolean): void {
    if (element) {
      isDisabled ? element.setAttribute('disabled', 'disabled') : element.removeAttribute('disabled');
    }
  }

  protected updateTextContent(element: HTMLElement, text: unknown): void {
    if (element) {
      element.textContent = String(text);
    }
  }

  protected updateImage(element: HTMLImageElement, source: string, alternativeText: string = ''): void {
    if (element) {
      element.src = source;
      element.alt = alternativeText;
    }
  }

  render(props?: Partial<T>): HTMLElement {
    if (props) {
      Object.assign(this as object, props);
    }
    return this.container;
  }
}
