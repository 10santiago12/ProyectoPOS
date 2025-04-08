import React, { createContext, useContext, useState, useEffect } from "react";
import { Product } from "@/interfaces/common"; 
import { getFirestore, collection, addDoc, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImagePicker from 'expo-image-picker';
import app from "../utils/FirebaseConfig";

interface ProductsContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>, photoUri?: string | null) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>; // Nueva función
  pickImage: () => Promise<string | undefined>;
  takePhoto: () => Promise<string | undefined>;
}

const ProductContext = createContext<ProductsContextType | undefined>(undefined);

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
};

export const ProductsProvider = ({ children }: { children: React.ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const db = getFirestore(app);
  const storage = getStorage(app);
  const productsCollection = collection(db, "products");

  const uploadImage = async (uri: string) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const storageRef = ref(storage, `product-images/${Date.now()}`);
      await uploadBytes(storageRef, blob);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error("Error uploading image: ", error);
      throw error;
    }
  };

  const addProduct = async (product: Omit<Product, 'id'>, photoUri?: string | null) => {
    try {
      let photoURL = null;
      
      if (photoUri) {
        photoURL = await uploadImage(photoUri);
      }
  
      await addDoc(productsCollection, {
        ...product,
        photo: photoURL,
        createdAt: new Date(),
      });
  
      return Promise.resolve();
    } catch (error: any) {
      console.error("Error adding product: ", error.message);
      return Promise.reject(error);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets[0].uri) {
        return result.assets[0].uri;
      }
    } catch (error) {
      console.error("Error picking image: ", error);
      return undefined;
    }
  };

  const takePhoto = async () => {
    try {
      await ImagePicker.requestCameraPermissionsAsync();
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets[0].uri) {
        return result.assets[0].uri;
      }
    } catch (error) {
      console.error("Error taking photo: ", error);
      return undefined;
    }
  };
  const deleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, "products", id));
      return Promise.resolve();
    } catch (error: any) {
      console.error("Error deleting product: ", error.message);
      return Promise.reject(error);
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
    <ProductContext.Provider value={{ 
      products, 
      addProduct, 
      deleteProduct, 
      pickImage, 
      takePhoto 
    }}>
      {children}
    </ProductContext.Provider>
  );
};