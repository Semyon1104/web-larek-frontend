import './scss/styles.scss';
import { Api } from './components/base/api';
import { API_URL, CDN_URL } from './utils/constants';
import { EventEmitter, IEvents } from './components/base/events';
import { BasketModel } from './models/BasketModel';
import { CatalogModel } from './models/CatalogModel';
import { BasketView } from './views/BasketView';
import { BasketItemView } from './views/BasketItemView';
import { CatalogView } from './views/CatalogView';
import { Product, transformProduct } from './types';

// Создаём экземпляр брокера событий
const events: IEvents = new EventEmitter();

// Создаём модели
const basketModel = new BasketModel(events);
const catalogModel = new CatalogModel();

// Получаем контейнер для каталога (предполагается, что в HTML есть элемент с классом .catalog)
const catalogContainer = document.querySelector('.catalog') as HTMLElement;
const catalogView = new CatalogView(catalogContainer);

// Получаем контейнер для корзины (предполагается, что в HTML есть элемент с классом .basket)
const basketContainer = document.querySelector('.basket') as HTMLElement;
const basketView = new BasketView(basketContainer);

// Создаём API-клиент, используя URL из переменной окружения или fallback
const api = new Api(API_URL);

// Функция для отрисовки корзины (пример, аналогичная уже реализованной)
function renderBasket(itemIds: string[]) {
  const items: HTMLElement[] = itemIds.map(id => {
    const product = catalogModel.getProduct(id);
    const container = document.createElement('div');
    container.className = 'basket-item';
    const titleElem = document.createElement('span');
    titleElem.className = 'basket-item_title';
    const addButton = document.createElement('button');
    addButton.className = 'basket-item_add';
    addButton.textContent = '+';
    const removeButton = document.createElement('button');
    removeButton.className = 'basket-item_remove';
    removeButton.textContent = '-';
    container.append(titleElem, addButton, removeButton);

    if (product) {
      const itemView = new BasketItemView(container, events);
      return itemView.render({ id: product.id, title: product.title });
    } else {
      return container;
    }
  });
  basketView.render({ items });
}

// Подписываемся на событие изменения корзины
events.on('basket:change', (data: { items: string[] }) => {
  renderBasket(data.items);
});

// Подписываемся на UI-события для добавления/удаления товара из корзины
events.on('ui:basket-add', (data: { id: string }) => {
  basketModel.add(data.id);
});
events.on('ui:basket-remove', (data: { id: string }) => {
  basketModel.remove(data.id);
});

// Загружаем каталог товаров через API
api.get('/product')
  .then(response => {
    // Предполагаем, что сервер возвращает объект { total, items }
    const apiResponse = response as { total: number; items: any[] };
    const products = apiResponse.items.map(item => transformProduct(item));
    catalogModel.setItems(products);
    console.log('Products loaded:', catalogModel.items);

    // Отрисовываем каталог, передавая товары в CatalogView
    catalogView.render({ products: catalogModel.items });
  })
  .catch(err => console.error(err));
