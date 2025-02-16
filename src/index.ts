import './scss/styles.scss';
import { ProductApi } from './components/base/api'
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

emitter.onAll(({ eventName, data }) => {
  console.log(eventName, data);
})

// Шаблоны
const successTpl = ensureElement<HTMLTemplateElement>('#success');
const cardCatalogTpl = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTpl = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTpl = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTpl = ensureElement<HTMLTemplateElement>('#basket');
const orderTpl = ensureElement<HTMLTemplateElement>('#order');
const contactsTpl = ensureElement<HTMLTemplateElement>('#contacts');


// Модель состояния приложения
const appData = new AppData({}, emitter);

// Глобальные контейнеры
const page = new Page(document.body, emitter);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), emitter)

// Переиспользуемые части интерфейса
const basket = new Basket(cloneTemplate<HTMLTemplateElement>(basketTpl), emitter);
const order = new Order(cloneTemplate<HTMLFormElement>(orderTpl), emitter);
const contacts = new Сontacts(cloneTemplate<HTMLFormElement>(contactsTpl), emitter);


// Бизнес-логика

// Получены данные карточек — сохраняем их в модели
emitter.on('items:changed', () => {
  page.catalog = appData.catalog.map((item) => {
    const card = new Card(cloneTemplate(cardCatalogTpl), {
      onClick: () => emitter.emit('card:select', item) // каждой карточке будет зарегано событие card:select
    });
    return card.render({
      title: item.title,
      category: item.category,
      image: api.cdn_url + item.image,
      price: item.price
    });
  })
})

// Пользователь выбрал карточку — передать данные для превью
emitter.on('card:select', (item: Product) => {
  appData.setPreview(item); // регистрирует событие preview:changed
});

// Получены данные для превью - отобразить данные превью
emitter.on('preview:changed', (item: Product) => {
  const card = new CardPreview(cloneTemplate(cardPreviewTpl), {
    onClick: () => emitter.emit('card:add', item)
  });

  modal.render({
    content: card.render({
      title: item.title,
      image: api.cdn_url + item.image,
      text: item.description,
      price: item.price,
      category: item.category
    })
  });
});

// Пользователь добавил товар в корзину: 
// - сохранить эти данные в заказ и корзине
// - инкрементировать счетчик
emitter.on('card:add', (item: Product) => {
  appData.addToOrder(item);
  appData.setProductToBasket(item);
  page.counter = appData.bskt.length;
  modal.close();
})

// Пользователь открыл корзину: 
// - отображаем кнопку в нужном режиме
// - отображаем сумму товаров в корзине
// - отображаем данные товаров в корзине
// - вставляем получившийся контент в модальное окно
emitter.on('basket:open', () => {
  basket.setDisabled(basket.button, appData.statusBasket);
  basket.total = appData.getTotal();
  let i = 1;
  basket.items = appData.bskt.map((item) => {
    const card = new CardBasket(cloneTemplate(cardBasketTpl), {
      onClick: () => emitter.emit('card:remove', item)
    });
    return card.render({
      title: item.title,
      price: item.price,
      index: i++
    });
  })
  modal.render({
    content: basket.render()
  })
})

// Пользователь удалил товар из корзины
// - удалить данные товара из списка корзины
// - удалить данные товара из списка заказа
// - обновить счетчик корзины
// - обновить статус кнопки
// - обновить статус суммы товаров
// - переотобразить товары в корзине
// - вставить контент в модалку
emitter.on('card:remove', (item: Product) => {
  appData.removeProductToBasket(item);
  appData.removeFromOrder(item);
  page.counter = appData.bskt.length;
  basket.setDisabled(basket.button, appData.statusBasket);
  basket.total = appData.getTotal();
  let i = 1;
  basket.items = appData.bskt.map((item) => {
    const card = new CardBasket(cloneTemplate(cardBasketTpl), {
      onClick: () => emitter.emit('card:remove', item)
    });
    return card.render({
      title: item.title,
      price: item.price,
      index: i++
    });
  })
  modal.render({
    content: basket.render()
  })
})

// Изменилось состояние валидации формы
emitter.on('formErrors:change', (errors: Partial<IOrderForm>) => {
  const { email, phone, address, payment } = errors;
  order.valid = !address && !payment;
  contacts.valid = !email && !phone;
  order.errors = Object.values({address, payment}).filter(i => !!i).join('; ');
  contacts.errors = Object.values({phone, email}).filter(i => !!i).join('; ');
});

// Изменилось одно из полей контактов - сохраняем данные об этом
emitter.on(/^contacts\..*:change/, (data: { field: keyof IOrderForm, value: string }) => {
  appData.setContactsField(data.field, data.value);
});

// Изменилось одно из полей заказа - сохраняем данные об этом
emitter.on(/^order\..*:change/, (data: { field: keyof IOrderForm, value: string }) => {
  appData.setOrderField(data.field, data.value);
});

// Пользователь выбрал способ оплаты - фиксируем данные об этом
emitter.on('payment:change', (item: HTMLButtonElement) => {
  appData.order.payment = item.name;
})

// Пользователь открывает окно заказа - рендерим модальное окно с контентом заказа
emitter.on('order:open', () => {
  modal.render({
    content: order.render({
      address: '',
      payment: 'card',
      valid: false,
      errors: []
    })
  });
});

// Пользователь отправляет форму заказа: 
// - передать данные суммы заказа
// - отрендерить следующих шаг
emitter.on('order:submit', () => {
  appData.order.total = appData.getTotal()
  modal.render({
    content: contacts.render({
      email: '',
      phone: '',
      valid: false,
      errors: []
    })
  });
})

// Пользователь открывает окно контактов - рендерим модальное окно с контентом контактов
// - передать серверу данные заказа
// - отрендерить модалку с успешной отправкой
emitter.on('contacts:submit', () => {
  api.order(appData.order)
    .then((result) => {
      console.log(appData.order)
      const success = new Success(cloneTemplate(successTpl), {
        onClick: () => {
          modal.close();
          appData.clearBasket();
          page.counter = appData.bskt.length;
        }
      });
    
      modal.render({
        content: success.render({
          total: appData.getTotal()
        })
      })
    })
    .catch(err => {
      console.error(err);
    })
});

// Блокируем прокрутку страницы если открыта модалка
emitter.on('modal:open', () => {
    page.locked = true;
});

// Разблокируем прокрутку страницы если открыта модалка
emitter.on('modal:close', () => {
    page.locked = false;
});

// Получаем лоты с сервера
api.getCatalog()
  .then(appData.setCatalog.bind(appData))
  .catch(err => {
    console.error(err);
});
