import { AuthProvider } from "@/context/AuthContext";
import { ProductsProvider } from "@/context/ProductContext";
import { OrdersProvider } from "@/context/OrderContext";
import { Stack } from "expo-router";
import React from "react";

export default function RootLayout() {
  return (
    <OrdersProvider>
    <AuthProvider>
    <ProductsProvider>
    <Stack>
        <Stack.Screen name="auth"options={{title:"Home", headerShown:false}}/>
        <Stack.Screen name="(app)"options={{title:"Login", headerShown:false}}/>
      </Stack>
    </ProductsProvider>
    </AuthProvider>
    </OrdersProvider>
  )
}
