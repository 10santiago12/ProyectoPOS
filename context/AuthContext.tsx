import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, 
  signOut, updateProfile, onAuthStateChanged, User as FirebaseUser 
} from "firebase/auth";
import { getFirestore, doc, setDoc, updateDoc, getDoc } from "firebase/firestore"; 
import app from "../utils/FirebaseConfig";
import { router } from "expo-router"; 
import { User } from "@/interfaces/common";

interface AuthContextType {
  user: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (user: User) => Promise<void>;
  updateUser: (user: Partial<User>) => Promise<void>;
  updateRole: (role: "chef" | "client" | "cashier") => Promise<void>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const auth = getAuth(app);  
  const db = getFirestore(app);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        await loadUserData(user.uid);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const loadUserData = async (uid: string) => {
    try {
      const userDocRef = doc(db, "users", uid);
      const userSnap = await getDoc(userDocRef);
      
      if (userSnap.exists()) {
        setUserData(userSnap.data() as User);
      } else {
        console.warn("User document not found");
        setUserData(null);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      setUserData(null);
    }
  };

  const refreshUserData = async () => {
    if (firebaseUser) {
      await loadUserData(firebaseUser.uid);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDocRef = doc(db, "users", userCredential.user.uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const data = userSnap.data() as User;
        setUserData(data);

        if (data.role === "client") {
          router.replace("/(app)/scan");
        } else {
          router.replace(`/(app)/${data.role}`);
        }
      } else {
        throw new Error("User data not found");
      }
    } catch (error: any) {
      console.error("Login error:", error.message);
      throw error;
    }
  };

  const register = async (user: User) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
      await updateProfile(userCredential.user, { displayName: user.name });

      const userDocRef = doc(db, "users", userCredential.user.uid);
      await setDoc(userDocRef, {
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: new Date(),
      });

      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        const data = userSnap.data() as User;
        setUserData(data);

        if (data.role === "client") {
          router.replace("/(app)/client");
        } else {
          router.replace(`/(app)/${data.role}`);
        }
      } else {
        throw new Error("User document not found after registration");
      }
    } catch (error: any) {
      console.error("Registration error:", error.message);
      throw error;
    }
  };

  const updateUser = async (user: Partial<User>) => {
    if (!firebaseUser) throw new Error("No user logged in");

    try {
      if (user.name) {
        await updateProfile(firebaseUser, { displayName: user.name });
      }

      const userDocRef = doc(db, "users", firebaseUser.uid);
      await updateDoc(userDocRef, {
        ...user,
        updatedAt: new Date(),
      });

      await refreshUserData();
    } catch (error: any) {
      console.error("Update user error:", error.message);
      throw error;
    }
  };

  const updateRole = async (role: "chef" | "client" | "cashier") => {
    if (!firebaseUser) throw new Error("No user logged in");

    try {
      const userDocRef = doc(db, "users", firebaseUser.uid);
      await updateDoc(userDocRef, {
        role,
        updatedAt: new Date(),
      });

      await refreshUserData();
      if (role === "client") {
        router.replace("/(app)/scan");
      } else {
        router.replace(`/(app)/${role}`);
      }
    } catch (error: any) {
      console.error("Update role error:", error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUserData(null);
      router.replace("/auth");
    } catch (error: any) {
      console.error("Logout error:", error.message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider 
      value={{
        user: firebaseUser,
        userData,
        loading,
        login,
        register,
        updateUser,
        updateRole,
        logout,
        refreshUserData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
