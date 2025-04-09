import React, { createContext, useContext, useState, useEffect } from "react";
import { getFirestore, collection, addDoc, serverTimestamp, onSnapshot, query, where, updateDoc, doc, DocumentData } from "firebase/firestore";
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
    orders: Order[];
    chefOrders: Order[]; // Órdenes filtradas para el chef (status = "Ordered")
    updateOrderStatus: (orderId: string, newStatus: Order["status"]) => Promise<void>;
    getCartTotal: () => number;
    getItemCount: () => number;
    loading: boolean;
    error: string | null;
}

const OrderContext = createContext<OrderContextType>({} as OrderContextType);

export const useOrders = () => useContext(OrderContext);

export const OrdersProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const [cart, setCart] = useState<OrderItem[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [chefOrders, setChefOrders] = useState<Order[]>([]); // Nuevo estado para órdenes del chef
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const db = getFirestore(app);
    const ordersCollection = collection(db, "orders");

    const parseFirestoreOrder = (docData: DocumentData, docId: string): Order => {
        return {
            id: docId,
            userId: docData.userId,
            items: docData.items,
            total: docData.total,
            status: docData.status,
            createdAt: docData.createdAt?.toDate() || new Date(),
            updatedAt: docData.updatedAt?.toDate() || new Date(),
        };
    };

    // Dentro de tu OrdersProvider (context)
useEffect(() => {
    if (!user?.uid) return;
    
    setLoading(true);
    // Query específica para órdenes del chef
    const qChef = query(
        ordersCollection,
        where("status", "==", "Ordered") // Filtro en servidor
    );
    
    const unsubscribeChef = onSnapshot(qChef, 
        (snapshot) => {
            try {
                const chefOrdersData = snapshot.docs.map(doc => 
                    parseFirestoreOrder(doc.data(), doc.id)
                );
                setChefOrders(chefOrdersData); // Actualiza solo órdenes del chef
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

    return () => unsubscribeChef();
}, [user?.uid]);

    // Función para actualizar el estado de una orden (ej: "Ordered" → "Preparing")
    const updateOrderStatus = async (orderId: string, newStatus: Order["status"]) => {
        setLoading(true);
        try {
            await updateDoc(doc(ordersCollection, orderId), {
                status: newStatus,
                updatedAt: serverTimestamp(),
            });
            setChefOrders(prev => 
                prev.map(order => 
                    order.id === orderId ? { ...order, status: newStatus } : order
                )
            );
        } catch (err) {
            setError(`Error al actualizar orden: ${err instanceof Error ? err.message : String(err)}`);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Funciones del carrito (sin cambios)
    const addToCart = (product: OrderItem) => {
        setCart(prev => {
            const existing = prev.find(item => item.productId === product.productId);
            return existing
                ? prev.map(item => 
                    item.productId === product.productId
                        ? { ...item, quantity: item.quantity + product.quantity }
                        : item
                    )
                : [...prev, product];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.productId !== productId));
    };

    const updateQuantity = (productId: string, newQuantity: number) => {
        setCart(prev => 
            prev.map(item => 
                item.productId === productId 
                    ? { ...item, quantity: newQuantity } 
                    : item
            )
        );
    };

    const clearCart = () => setCart([]);

    const getCartTotal = () => 
        cart.reduce((total, item) => total + (item.price * item.quantity), 0);

    const getItemCount = () => 
        cart.reduce((count, item) => count + item.quantity, 0);

    const createOrder = async (notes?: string) => {
        if (!user?.uid) throw new Error("Usuario no autenticado");
        if (cart.length === 0) throw new Error("El carrito está vacío");

        setLoading(true);
        try {
            const orderData = {
                userId: user.uid,
                items: cart,
                total: getCartTotal(),
                status: "Ordered" as const,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                ...(notes && { notes }),
            };

            const docRef = await addDoc(ordersCollection, orderData);
            clearCart();
            return docRef.id;
        } catch (err) {
            setError(`Error al crear orden: ${err instanceof Error ? err.message : String(err)}`);
            throw err;
        } finally {
            setLoading(false);
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
                orders,
                chefOrders, // Órdenes filtradas para el chef
                updateOrderStatus, // Nueva función
                getCartTotal,
                getItemCount,
                loading,
                error,
            }}
        >
            {children}
        </OrderContext.Provider>
    );
};