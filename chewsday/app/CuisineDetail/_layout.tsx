import "react-native-reanimated";
import React from "react";
import { Stack } from "expo-router";

export default function CuisineDetailLayout() {
  return (
        <Stack>
            <Stack.Screen
                name="RestaurantDetail"
                options={{
                    title: "",
                }}
            />
            <Stack.Screen
                name="CuisineResult"
                options={{
                    title: "DishResult",
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="CookingMethod"
                options={{
                    title: "CookingMethod",
                    headerShown: false,
                }}
            />
        </Stack>
  );
}
