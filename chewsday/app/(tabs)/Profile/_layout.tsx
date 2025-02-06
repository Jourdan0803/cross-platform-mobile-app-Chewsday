import React from "react";
import { useColorScheme } from "react-native";
import { Stack } from "expo-router";

export default function TabsLayout() {
  const scheme = useColorScheme() ?? 'light';

  return (
        <Stack>
            <Stack.Screen
                name="ProfileScreen"
                options={{
                    title: "ProfileScreen",
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="FavCuisineScreen"
                options={{
                    title: "",
                }}
            />
            <Stack.Screen
                name="FavRestaurantScreen"
                options={{
                    title: "",
                }}
            />
            <Stack.Screen
                name="LoginScreen"
                options={{
                    title: "Login",
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="RegisterScreen"
                options={{
                    title: "Register",
                    headerShown: false,
                }}
            />
        </Stack>
  );
}
