import "react-native-reanimated";
import React from "react";
import { useColorScheme } from "react-native";
import { Stack } from "expo-router";

export default function TabsLayout() {
  const scheme = useColorScheme() ?? 'light';

  return (
        <Stack>
            <Stack.Screen
                name="CategoryScreen"
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="CategoryDetailScreen"
                options={{
                    title: "ProfileScreen",
                    headerShown: false,
                }}
            />
        </Stack>
  );
}
