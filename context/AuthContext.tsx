import { User } from "@/interfaces/common";
import { Children, createContext } from "react";

export const AuthContext = createContext({})
export const AuthProvider = ({children}:any) => {

    const login = (email:string, password:string)=>{

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