import { AuthProvider } from "@/context/AuthContext";
import { Stack } from "expo-router";
import React from "react";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="auth"/>
        <Stack.Screen name="(app)"/>
      </Stack>
    </AuthProvider>
  )
}
