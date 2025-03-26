import { User } from "@/interfaces/common";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore"; 
import { Children, createContext } from "react";
import app from "../utils/FirebaseConfig";

export const AuthContext = createContext({})
export const AuthProvider = ({children}:any) => {

    const auth = getAuth(app);
    const db = getFirestore(app);

    const login = (email:string, password:string)=>{
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            setUser(userCredential.user);
        } catch (error: unknown) {
            if (error instanceof Error) {
                setError(getFirebaseErrorMessage(error));
            } else {
                setError("An error occurred. Please try again.");
            }
            throw error;
        } finally {
            setLoading(false);
        }
    }

    const register = (user:User)=>{


    }

    const updateUser = (user:User)=>{
    
    }

    const updateRole = (role:"chef"|"client"|"cashier")=>{
            
    }
    
    const logout = ()=>{
        
    }

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
    )
}

function setUser(user: any) {
    throw new Error("Function not implemented.");
}
