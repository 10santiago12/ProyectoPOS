import { Stack } from "expo-router";
import React from "react";

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{title:"Home", headerShown:false}}/>
      <Stack.Screen name="cashier" options={{title:"Cashier", headerShown:false}}/>
      <Stack.Screen name="client" options={{title:"Client", headerShown:false}}/>
      <Stack.Screen name="chef" options={{title:"Chef", headerShown:false}}/>
      <Stack.Screen name="scan" options={{title:"Scan", headerShown:false}}/>
    </Stack>
  );
}