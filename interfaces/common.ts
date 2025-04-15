import { FieldValue } from "firebase/firestore";

export interface User {
name:string, 
email:string, 
password:string, 
role:"chef"|"client"|"cashier"
}

export interface Product {
    id?: string;
    title: string;
    description: string;
    type: ProductType;
    price: string;
    photo?: string;
    createdAt?: Date;
}

export interface CartItem extends Product {
    quantity: number;
}

export type ProductType = "starter" | "fastfood" | "drink" | "dessert";

export interface OrderItem {
    productId: string;
    title: string;
    price: number;
    quantity: number;
}

export interface Order {
    id?: string;
    userId: string;
    items: OrderItem[];
    total: number;
    status: "Ordered" | "Preparing" | "Ready" | "Delivered" | "Cancelled";
    createdAt?: Date | FieldValue;
    updatedAt?: Date | FieldValue;
}

export interface OrderContextType {
    cart: OrderItem[];
    addToCart: (product: OrderItem) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, newQuantity: number) => void;
    clearCart: () => void;
    createOrder: (notes?: string) => Promise<string>;
    currentOrder: Order | null;
    orders: Order[];
    getCartTotal: () => number;
    getItemCount: () => number;
    loading: boolean;
    error: string | null;
    updateOrderStatus: (orderId: string, newStatus: string) => Promise<void>;
    getActiveOrders: () => Order[];
    }
