import { Stack } from "expo-router";
import React from "react";

export default function AppLayout() {
return (
<Stack>
    <Stack.Screen name="index" options={{title:"Home", headerShown:false}}/>
</Stack>
);
}