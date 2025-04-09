import React, { createContext, useContext, useState, useEffect } from "react";
import { getFirestore, collection, addDoc, serverTimestamp, onSnapshot, query, where, updateDoc, doc, DocumentData } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import app from "../utils/FirebaseConfig";
import { Order, OrderItem } from "@/interfaces/common";
import { getAuth } from "firebase/auth";

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
  loading: boolean;
  error: string | null;
  updateOrderStatus: (orderId: string, newStatus: string) => Promise<void>;  // Nueva función para actualizar estado
}

const OrderContext = createContext<OrderContextType>({} as OrderContextType);

export const useOrders = () => useContext(OrderContext);

export const OrdersProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
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
      createdAt: docData.createdAt?.toDate?.() || new Date(),
      updatedAt: docData.updatedAt?.toDate?.() || new Date(),
    };
  };

  useEffect(() => {
    setLoading(true);
    const q = query(ordersCollection, where("status", "==", "Ordered"));

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
          const error = err instanceof Error ? err : new Error(String(err));
          setError(`Error al procesar órdenes: ${error.message}`);
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
        items: cart.map((item) => ({
          productId: item.productId,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
        })),
        total: getCartTotal(),
        status: "Ordered" as const,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...(notes && { notes }),
      };

      const docRef = await addDoc(ordersCollection, orderData);

      const newOrder: Order = {
        ...orderData,
        id: docRef.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setCurrentOrder(newOrder);
      setOrders((prev) => [...prev, newOrder]);
      clearCart();
      console.log("Orden creada con éxito!! el ID es: ", docRef.id);

      return docRef.id;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(`Error al crear orden: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar el estado de la orden
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const orderDocRef = doc(db, "orders", orderId);
      await updateDoc(orderDocRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
      console.log(`Estado de la orden ${orderId} actualizado a ${newStatus}`);
    } catch (error) {
      setError("Error al actualizar el estado de la orden: " + (error instanceof Error ? error.message : String(error)));
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
        loading,
        error,
        updateOrderStatus, // Proveer la función para actualizar estado
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};