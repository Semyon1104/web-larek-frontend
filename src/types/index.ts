
export type ApiProduct = {
    id: string;
    title: string;
    description: string;
    image: string;
    category: string;
    price: number | null;
};

export type ApiProductList = {
    total: number;
    items: ApiProduct[];
};

export type ApiOrderResponse = {
    id: string;
    total: number;
};

export type ApiErrorResponse = {
    error: string;
};



export type Product = {
    id: string;
    title: string;
    details: string;
    image: string;
    category: string;
    price: number | null;
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
    paymentMethod: "online" | "cash" | "card";
    address: string;
};

export type User = {
    id: string;
    email: string;
    phone: string;
};


export const transformProduct = (apiProduct: ApiProduct): Product => ({
    id: apiProduct.id,
    title: apiProduct.title,
    details: apiProduct.description,
    image: apiProduct.image,
    category: apiProduct.category,
    price: apiProduct.price,
});
