import './scss/styles.scss';
import { ProductApi } from './components/base/api';
import { EventEmitter } from './components/base/events';
import { API_URL, CDN_URL } from './utils/constants';
import { cloneTemplate, ensureElement } from './utils/utils';
import { AppData, Product } from './components/AppData';
import { Page } from './components/Page';
import { Card, CardBasket, CardPreview } from './components/Card';
import { Modal } from './components/common/Modal';
import { Basket } from './components/common/Basket';
import { Order, Сontacts } from './components/Order';
import { IOrderForm } from './types';
import { Success } from './components/common/Success';

const emitter = new EventEmitter();
const api = new ProductApi(CDN_URL, API_URL);

// Шаблоны
const templates = {
  success: ensureElement<HTMLTemplateElement>('#success'),
  cardCatalog: ensureElement<HTMLTemplateElement>('#card-catalog'),
  cardPreview: ensureElement<HTMLTemplateElement>('#card-preview'),
  cardBasket: ensureElement<HTMLTemplateElement>('#card-basket'),
  basket: ensureElement<HTMLTemplateElement>('#basket'),
  order: ensureElement<HTMLTemplateElement>('#order'),
  contacts: ensureElement<HTMLTemplateElement>('#contacts'),
};

// Модель состояния приложения
const appData = new AppData({}, emitter);

// Глобальные контейнеры
const page = new Page(document.body, emitter);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), emitter);

// Переиспользуемые части интерфейса
const basket = new Basket(cloneTemplate<HTMLTemplateElement>(templates.basket), emitter);
const order = new Order(cloneTemplate<HTMLFormElement>(templates.order), emitter);
const contacts = new Сontacts(cloneTemplate<HTMLFormElement>(templates.contacts), emitter);

// Обработчики событий

// Обработка изменения карточек
emitter.on('items:changed', () => {
  page.catalog = appData.catalog.map((item) => {
    const card = new Card(cloneTemplate(templates.cardCatalog), {
      onClick: () => emitter.emit('card:select', item),
    });
    return card.render({
      title: item.title,
      category: item.category,
      image: api.cdn_url + item.image,
      price: item.price,
    });
  });
});

// Обработка выбора карточки для превью
emitter.on('card:select', (item: Product) => {
  appData.setPreview(item); // регистрирует событие preview:changed
});

// Обработка изменения превью карточки
emitter.on('preview:changed', (item: Product) => {
  const card = new CardPreview(cloneTemplate(templates.cardPreview), {
    onClick: () => emitter.emit('card:add', item),
  });

  modal.render({
    content: card.render({
      title: item.title,
      image: api.cdn_url + item.image,
      text: item.description,
      price: item.price,
      category: item.category,
    }),
  });
});

// Добавление товара в корзину
emitter.on('card:add', (item: Product) => {
  appData.addToOrder(item);
  appData.setProductToBasket(item);
  page.counter = appData.bskt.length;
  modal.hide();
});

// Открытие корзины
emitter.on('basket:open', () => {
  basket.setDisabledState(basket.actionButton, appData.statusBasket);
  basket.total = appData.getTotal();
  basket.items = appData.bskt.map((item, index) => {
    const card = new CardBasket(cloneTemplate(templates.cardBasket), {
      onClick: () => emitter.emit('card:remove', item),
    });
    return card.render({
      title: item.title,
      price: item.price,
      index: index + 1,
    });
  });
  modal.render({
    content: basket.render(),
  });
});

// Удаление товара из корзины
emitter.on('card:remove', (item: Product) => {
  appData.removeProductToBasket(item);
  appData.removeFromOrder(item);
  page.counter = appData.bskt.length;
  basket.setDisabledState(basket.actionButton, appData.statusBasket);
  basket.total = appData.getTotal();
  basket.items = appData.bskt.map((item, index) => {
    const card = new CardBasket(cloneTemplate(templates.cardBasket), {
      onClick: () => emitter.emit('card:remove', item),
    });
    return card.render({
      title: item.title,
      price: item.price,
      index: index + 1,
    });
  });
  modal.render({
    content: basket.render(),
  });
});

// Обработка изменений валидации формы
emitter.on('formErrors:change', (errors: Partial<IOrderForm>) => {
  const { email, phone, address, payment } = errors;
  order.isValid = !address && !payment;
  contacts.isValid = !email && !phone;
  order.errorMessages = Object.values({ address, payment }).filter(Boolean).join('; ');
  contacts.errorMessages = Object.values({ phone, email }).filter(Boolean).join('; ');
});

// Сохранение данных об изменениях в полях контактов
emitter.on(/^contacts\..*:change/, (data: { field: keyof IOrderForm, value: string }) => {
  appData.setContactsField(data.field, data.value);
});

// Сохранение данных об изменениях в полях заказа
emitter.on(/^order\..*:change/, (data: { field: keyof IOrderForm, value: string }) => {
  appData.setOrderField(data.field, data.value);
});

// Фиксация выбранного способа оплаты
emitter.on('payment:change', (item: HTMLButtonElement) => {
  appData.order.payment = item.name;
});

// Открытие окна заказа
emitter.on('order:open', () => {
  modal.render({
    content: order.render({
      address: '',
      payment: 'card',
      isValid: false,
      errorMessages: [],
    }),
  });
});

// Отправка формы заказа
emitter.on('order:submit', () => {
  appData.order.total = appData.getTotal();
  modal.render({
    content: contacts.render({
      email: '',
      phone: '',
      isValid: false,
      errorMessages: [],
    }),
  });
});

// Отправка данных контактов на сервер
emitter.on('contacts:submit', () => {
  api.order(appData.order)
    .then(() => {
      const success = new Success(cloneTemplate(templates.success), {
        onClose: () => {
          modal.hide();
          appData.clearBasket();
          page.counter = appData.bskt.length;
        },
      });

      modal.render({
        content: success.render({
          total: appData.getTotal(),
        }),
      });
    })
    .catch(err => {
      console.error(err);
    });
});

// Блокировка прокрутки страницы, если открыта модалка
emitter.on('modal:open', () => {
  page.locked = true;
});

// Разблокировка прокрутки страницы, если модалка закрыта
emitter.on('modal:close', () => {
  page.locked = false;
});

// Загрузка лотов с сервера
api.getCatalog()
  .then(appData.setCatalog.bind(appData))
  .catch(err => {
    console.error(err);
  });
