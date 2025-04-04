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
    type: string;
    price: string;
    photo?: string;
    createdAt?: Date;
}
