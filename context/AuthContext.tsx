import { User } from "@/interfaces/common";
import { 
getAuth, 
createUserWithEmailAndPassword, 
signInWithEmailAndPassword,
signOut,
updateProfile,
User as FirebaseUser
} from "firebase/auth";
import { getFirestore, doc, setDoc, updateDoc } from "firebase/firestore"; 
import { createContext, useContext } from "react";
import app from "../utils/FirebaseConfig";
import { router } from "expo-router";

interface AuthContextType {
login: (email: string, password: string) => Promise<void>;
register: (user: User) => Promise<void>;
updateUser: (user: Partial<User>) => Promise<void>;
updateRole: (role: "chef" | "client" | "cashier") => Promise<void>;
logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({children}: {children: React.ReactNode}) => {
const auth = getAuth(app);  
const db = getFirestore(app);

const login = async (email: string, password: string) => {
    try {
    await signInWithEmailAndPassword(auth, email, password);
    router.replace("/home");
    } catch (error: any) {
    console.error("Login error:", error.message);
    throw error;
    }
};

const register = async (user: User) => {
    try {
    // 1. Crear usuario en Authentication
    const userCredential = await createUserWithEmailAndPassword(
        auth, 
        user.email, 
        user.password
    );
    
    // 2. Actualizar el perfil con el nombre
    await updateProfile(userCredential.user, {
        displayName: user.name
    });

    // 3. Guardar información adicional en Firestore
    const userDocRef = doc(db, "users", userCredential.user.uid);
    await setDoc(userDocRef, {
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: new Date()
    });

    router.replace("/home");
    } catch (error: any) {
    console.error("Registration error:", error.message);
    throw error;
    }
};

const updateUser = async (user: Partial<User>) => {
    try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("No user logged in");

    // Actualizar en Authentication si hay cambios en nombre o email
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
    router.replace("/login");
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
}