import React, { createContext, useContext, useState, useEffect } from "react";
import { getFirestore, collection, addDoc, serverTimestamp, onSnapshot, query, updateDoc, doc, DocumentData, orderBy } from "firebase/firestore";
import app from "../utils/FirebaseConfig";
import { Order, OrderItem, OrderContextType } from "@/interfaces/common";
import { getAuth } from "firebase/auth";

const OrderContext = createContext<OrderContextType>({} as OrderContextType);

export const useOrders = () => useContext(OrderContext);

export const OrdersProvider = ({ children }: { children: React.ReactNode }) => {
const [cart, setCart] = useState<OrderItem[]>([]);
const [orders, setOrders] = useState<Order[]>([]);
const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const db = getFirestore(app);
const ordersCollection = collection(db, "orders");

const parseFirestoreDate = (timestamp: any): Date => {
    if (timestamp?.toDate) {
    return timestamp.toDate();
    }
    return timestamp instanceof Date ? timestamp : new Date();
};

const parseFirestoreOrder = (docData: DocumentData, docId: string): Order => {
    return {
    id: docId,
    userId: docData.userId,
    items: docData.items || [],
    total: docData.total || 0,
    status: docData.status || "Ordered",
    createdAt: parseFirestoreDate(docData.createdAt),
    updatedAt: parseFirestoreDate(docData.updatedAt),
    };
};

useEffect(() => {
    setLoading(true);
    const q = query(
    ordersCollection,
    orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
        try {
        const ordersData = snapshot.docs.map((doc) =>
            parseFirestoreOrder(doc.data(), doc.id)
        );
        setOrders(ordersData);
        setError(null);
        } catch (err) {
        setError(`Error al procesar órdenes: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
        setLoading(false);
        }
    },
    (err) => {
        setError(`Error en la conexión: ${err.message}`);
        setLoading(false);
    }
    );

    return () => unsubscribe();
}, []);

const findCartItem = (productId: string) =>
    cart.find((item) => item.productId === productId);

const addToCart = (product: OrderItem) => {
    setCart((prev) => {
    const existing = findCartItem(product.productId);
    return existing
        ? prev.map((item) =>
            item.productId === product.productId
            ? { ...item, quantity: item.quantity + product.quantity }
            : item
        )
        : [...prev, product];
    });
};

const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
};

const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
    removeFromCart(productId);
    return;
    }
    setCart((prevCart) =>
    prevCart.map((item) =>
        item.productId === productId
        ? { ...item, quantity: newQuantity }
        : item
    )
    );
};

const clearCart = () => setCart([]);

const getCartTotal = () =>
    cart.reduce((total, item) => total + item.price * item.quantity, 0);

const getItemCount = () =>
    cart.reduce((count, item) => count + item.quantity, 0);

const createOrder = async (notes?: string) => {
    const currentUser = getAuth().currentUser;
    if (!currentUser) throw new Error("Usuario no autenticado");
    if (cart.length === 0) throw new Error("El carrito está vacío");

    setLoading(true);
    setError(null);

    try {
    const orderData = {
        userId: currentUser.uid,
        items: cart.map(item => ({
        productId: item.productId,
        title: item.title,
        price: item.price,
        quantity: item.quantity
        })),
        total: getCartTotal(),
        status: "Ordered",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...(notes && { notes }),
    };

    const docRef = await addDoc(ordersCollection, orderData);
    
    const newOrder: Order = {
        id: docRef.id,
        userId: orderData.userId,
        items: orderData.items,
        total: orderData.total,
        status: orderData.status as "Ordered" | "Preparing" | "Ready" | "Delivered" | "Cancelled",
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    setCurrentOrder(newOrder);
    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    return docRef.id;

    } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    setError(`Error al crear orden: ${error.message}`);
    throw error;
    } finally {
    setLoading(false);
    }
};

const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
    const validStatuses = ["Ordered", "Preparing", "Ready", "Completed", "Cancelled"];
    if (!validStatuses.includes(newStatus)) {
        throw new Error(`Estado no válido: ${newStatus}`);
    }

    const orderDocRef = doc(db, "orders", orderId);
    await updateDoc(orderDocRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
    });
    } catch (error) {
    setError("Error al actualizar estado: " + (error instanceof Error ? error.message : String(error)));
    throw error;
    }
};

const getActiveOrders = () => {
    return orders.filter(order => 
    ["Ordered", "Preparing", "Ready"].includes(order.status)
    );
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
        loading,
        error,
        updateOrderStatus,
        getActiveOrders,
    }}
    >
    {children}
    </OrderContext.Provider>
);
};