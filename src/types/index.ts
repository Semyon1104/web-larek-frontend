export type ApiProduct = {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string;
};

export type ApiCartItem = {
    product: ApiProduct;
    quantity: number;
};

export type ApiCart = {
    items: ApiCartItem[];
};

export type ApiOrder = {
    id: string;
    items: ApiCartItem[];
    totalAmount: number;
    status: "pending" | "shipped" | "delivered" | "cancelled";
    createdAt: string;
};

export type ApiUser = {
    id: string;
    email: string;
    phone: string;
};

export type ApiResponse<T> = {
    success: boolean;
    data: T;
};


export type Product = {
    id: string;
    title: string;
    details: string;
    price: number;
    category: string;
    image: string;
};

export type CartItem = {
    product: Product;
    quantity: number;
};

export type Cart = {
    items: CartItem[];
};

export type Order = {
    id: string;
    items: CartItem[];
    total: number;
    status: "pending" | "shipped" | "delivered" | "cancelled";
    date: Date;
};

export type User = {
    id: string;
    email: string;
    phone: string;
};

export const transformProduct = (apiProduct: ApiProduct): Product => ({
    id: apiProduct.id,
    title: apiProduct.name,
    details: apiProduct.description,
    price: apiProduct.price,
    category: apiProduct.category,
    image: apiProduct.imageUrl,
});

export const transformCartItem = (apiCartItem: ApiCartItem): CartItem => ({
    product: transformProduct(apiCartItem.product),
    quantity: apiCartItem.quantity,
});

export const transformOrder = (apiOrder: ApiOrder): Order => ({
    id: apiOrder.id,
    items: apiOrder.items.map(transformCartItem),
    total: apiOrder.totalAmount,
    status: apiOrder.status,
    date: new Date(apiOrder.createdAt),
});

export const transformUser = (apiUser: ApiUser): User => ({
    id: apiUser.id,
    email: apiUser.email,
    phone: apiUser.phone,
});
