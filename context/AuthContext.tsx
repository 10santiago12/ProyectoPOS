import { User } from "@/interfaces/common";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import { getFirestore, doc, setDoc, updateDoc, getDoc } from "firebase/firestore"; 
import { createContext, useContext } from "react";
import app from "../utils/FirebaseConfig";
import { router } from "expo-router"; 
import React from "react"; 
interface AuthContextType {
  login: (email: string, password: string) => Promise<void>;
  register: (user: User) => Promise<void>;
  updateUser: (user: Partial<User>) => Promise<void>;
  updateRole: (role: "chef" | "client" | "cashier") => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const auth = getAuth(app);  
  const db = getFirestore(app);

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Login successful");

      const uid = userCredential.user.uid;
      const userDocRef = doc(db, "users", uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        switch (userData.role) {
          case "chef":
            router.replace("/(app)/chef");
            break;
          case "client":
            router.replace("/(app)/client");
            break;
          case "cashier":
            router.replace("/(app)/cashier");
            break;
        }
      } else {
        console.warn("User document not found");
      }
    } catch (error: any) {
      console.error("Login error:", error.message);
      throw error;
    }
  };

  const register = async (user: User) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        user.email,
        user.password
      );

      await updateProfile(userCredential.user, {
        displayName: user.name,
      });

      const userDocRef = doc(db, "users", userCredential.user.uid);
      await setDoc(userDocRef, {
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: new Date(),
      });

      console.log("Registration successful");

      // Redirect based on user role
      switch (user.role) {
        case "chef":
          router.replace("/(app)/chef");
          break;
        case "client":
          router.replace("/(app)/client");
          break;
        case "cashier":
          router.replace("/(app)/cashier");
          break;
      }
    } catch (error: any) {
      console.error("Registration error:", error.message);
      throw error;
    }
  };

  const updateUser = async (user: Partial<User>) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("No user logged in");

      if (user.name) {
        await updateProfile(currentUser, {
          displayName: user.name
        });
      }

      // Actualizar en Firestore
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
        ...user,
        updatedAt: new Date()
      });
    } catch (error: any) {
      console.error("Update user error:", error.message);
      throw error;
    }
  };

  const updateRole = async (role: "chef" | "client" | "cashier") => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("No user logged in");

      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
        role,
        updatedAt: new Date()
      });
    } catch (error: any) {
      console.error("Update role error:", error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      console.log("Logout successful");
    } catch (error: any) {
      console.error("Logout error:", error.message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider 
      value={{
        login,
        register,
        updateUser,
        updateRole,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};