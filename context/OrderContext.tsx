import React, { createContext, useContext, useState } from "react";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import app from "../utils/FirebaseConfig";
import { Order, OrderItem } from "@/interfaces/common";

interface OrderContextType {
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
}

const OrderContext = createContext<OrderContextType>({} as OrderContextType);

export const useOrders = () => useContext(OrderContext);

export const OrdersProvider = ({ children }: { children: React.ReactNode }) => {
const { user } = useAuth();
const [cart, setCart] = useState<OrderItem[]>([]);
const [orders, setOrders] = useState<Order[]>([]);
const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
const db = getFirestore(app);
const ordersCollection = collection(db, "orders");

  // Helper para encontrar un item en el carrito
const findCartItem = (productId: string) => 
cart.find(item => item.productId === productId);

// Añadir al carrito
const addToCart = (product: OrderItem) => {
setCart(prev => {
    const existing = findCartItem(product.productId);
    return existing
    ? prev.map(item => 
        item.productId === product.productId
            ? { ...item, quantity: item.quantity + product.quantity }
            : item
        )
    : [...prev, product];
});
};

// Remover del carrito
const removeFromCart = (productId: string) => {
setCart(prev => prev.filter(item => item.productId !== productId));
};

// Actualizar cantidad
const updateQuantity = (productId: string, quantity: number) => {
if (quantity < 1) {
    removeFromCart(productId);
    return;
}
setCart(prev => 
    prev.map(item => 
    item.productId === productId ? { ...item, quantity } : item
    )
);
};

// Vaciar carrito
const clearCart = () => setCart([]);

// Calcular total
const getCartTotal = () => 
cart.reduce((total, item) => total + (item.price * item.quantity), 0);

// Contar items
const getItemCount = () => 
cart.reduce((count, item) => count + item.quantity, 0);

// Crear orden
const createOrder = async (notes?: string) => {
if (!user || !user.uid || cart.length === 0) {
    throw new Error("Invalid order data");
}

const orderData: Omit<Order, 'id'> = {
    userId: user.uid,
    items: cart,
    total: getCartTotal(),
    status: "Ordered",
    createdAt: serverTimestamp() as any,
    updatedAt: serverTimestamp() as any,
};

try {
    const docRef = await addDoc(ordersCollection, orderData);
    const orderWithId = { ...orderData, id: docRef.id };
    
    setCurrentOrder(orderWithId);
    setOrders(prev => [...prev, orderWithId]);
    clearCart();
    
    return docRef.id;
} catch (error) {
    console.error("Order creation error:", error);
    throw error;
}
};

return (
<OrderContext.Provider
    value={{
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    createOrder,
    currentOrder,
    orders,
    getCartTotal,
    getItemCount,
    }}
>
    {children}
</OrderContext.Provider>
);
};