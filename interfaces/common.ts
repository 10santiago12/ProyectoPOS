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
