import { Product } from '../types';

export interface IView {
  render(data?: object): HTMLElement;
}

export class CatalogView implements IView {
  constructor(protected container: HTMLElement) {}

  render(data: { products: Product[] }): HTMLElement {
    // Очищаем контейнер
    this.container.innerHTML = '';

    // Для каждого товара создаём карточку
    data.products.forEach(product => {
      const card = document.createElement('div');
      card.className = 'product-card';

      // Изображение товара
      const img = document.createElement('img');
      img.src = product.image;
      img.alt = product.title;
      card.appendChild(img);

      // Название товара
      const title = document.createElement('h3');
      title.textContent = product.title;
      card.appendChild(title);

      // Цена товара
      const price = document.createElement('p');
      price.textContent = product.price !== null ? `$${product.price}` : 'Бесценно';
      card.appendChild(price);

      // Можно добавить обработчик клика для открытия деталей товара
      card.addEventListener('click', () => {
        // Здесь можно эмитировать событие для открытия модального окна с деталями товара
        console.log(`Открыть детали для продукта ${product.title}`);
      });

      // Добавляем карточку в контейнер
      this.container.appendChild(card);
    });

    return this.container;
  }
}
