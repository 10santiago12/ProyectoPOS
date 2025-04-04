import React, { createContext, useContext, useState, useEffect } from "react";
import { getFirestore, collection, addDoc, onSnapshot } from "firebase/firestore";
import app from "../utils/FirebaseConfig";

export interface Product {
  id?: string;
  title: string;
  description: string;
  type: string;
  price: string;
}

interface ProductsContextType {
  products: Product[];
  addProduct: (product: Product) => Promise<void>;
}

const ProductsContext = createContext<ProductsContextType>({} as ProductsContextType);

export const useProducts = () => useContext(ProductsContext);

export const ProductsProvider = ({ children }: { children: React.ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const db = getFirestore(app);
  const productsCollection = collection(db, "products");

  const addProduct = async (product: Product) => {
    try {
      const docRef = await addDoc(productsCollection, {
        ...product,
        createdAt: new Date(),
      });
      setProducts((prevProducts) => [...prevProducts, { id: docRef.id, ...product }]);
    } catch (error: any) {
      console.error("Error adding products: ", error.message);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(productsCollection, (snapshot) => {
      const productsData: Product[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      setProducts(productsData);
    });
    return unsubscribe;
  }, []);

  return (
    <ProductsContext.Provider value={{ products, addProduct }}>
      {children}
    </ProductsContext.Provider>
  );
};