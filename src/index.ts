import './scss/styles.scss';
import { ProductApi } from './components/base/api';
import { EventEmitter } from './components/base/events';
import { API_URL, CDN_URL } from './utils/constants';
import { cloneTemplate, ensureElement } from './utils/utils';
import { AppData, Product } from './components/Model/AppData';
import { Page } from './components/Model/simple/Page';
import { Card, CardBasket, CardPreview } from './components/Model/simple/Card';
import { Modal } from './components/common/Modal';
import { Basket } from './components/Model/Basket';
import { Order, Сontacts } from './components/Model/simple/Order';
import { IOrderForm } from './types';
import { Success } from './components/common/Success';

const emitter = new EventEmitter();
const api = new ProductApi(CDN_URL, API_URL);

const templates = {
  success: ensureElement<HTMLTemplateElement>('#success'),
  cardCatalog: ensureElement<HTMLTemplateElement>('#card-catalog'),
  cardPreview: ensureElement<HTMLTemplateElement>('#card-preview'),
  cardBasket: ensureElement<HTMLTemplateElement>('#card-basket'),
  basket: ensureElement<HTMLTemplateElement>('#basket'),
  order: ensureElement<HTMLTemplateElement>('#order'),
  contacts: ensureElement<HTMLTemplateElement>('#contacts'),
};

const appData = new AppData({}, emitter);

const page = new Page(document.body, emitter);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), emitter);

const basket = new Basket(cloneTemplate<HTMLTemplateElement>(templates.basket), emitter);
const order = new Order(cloneTemplate<HTMLFormElement>(templates.order), emitter);
const contacts = new Сontacts(cloneTemplate<HTMLFormElement>(templates.contacts), emitter);

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

emitter.on('card:select', (item: Product) => {
  appData.setPreview(item);
});

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

emitter.on('card:add', (item: Product) => {
  appData.addToOrder(item);
  appData.setProductToBasket(item);
  page.counter = appData.bskt.length;
  modal.hide();
});

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

emitter.on('formErrors:change', (errors: Partial<IOrderForm>) => {
  const { email, phone, address, payment } = errors;
  order.isValid = !address && !payment;
  contacts.isValid = !email && !phone;
  order.errorMessages = Object.values({ address, payment }).filter(Boolean).join('; ');
  contacts.errorMessages = Object.values({ phone, email }).filter(Boolean).join('; ');
});

emitter.on(/^contacts\..*:change/, (data: { field: keyof IOrderForm, value: string }) => {
  appData.setContactsField(data.field, data.value);
});

emitter.on(/^order\..*:change/, (data: { field: keyof IOrderForm, value: string }) => {
  appData.setOrderField(data.field, data.value);
});

emitter.on('payment:change', (item: HTMLButtonElement) => {
  appData.order.payment = item.name;
});

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

emitter.on('modal:open', () => {
  page.locked = true;
});

emitter.on('modal:close', () => {
  page.locked = false;
});

api.getCatalog()
  .then(appData.setCatalog.bind(appData))
  .catch(err => {
    console.error(err);
  });
