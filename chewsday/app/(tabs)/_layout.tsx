import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import React from "react";
import { useColorScheme, View } from "react-native";
import { Tabs } from "expo-router";
import Feather from '@expo/vector-icons/Feather';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function TabsLayout() {
  const scheme = useColorScheme() ?? 'light';

  return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Tabs
            screenOptions={{
              headerTintColor: scheme === 'dark' ? 'white' : 'black',
              headerShown: false,
              tabBarLabelStyle: { fontSize: 14 },
              tabBarStyle: { backgroundColor: scheme === 'dark' ? '#000' : '#fff', height: 60, paddingTop: 6, paddingBottom: 6 }, 
              tabBarActiveTintColor: '#F2913D', 
              tabBarInactiveTintColor: 'gray', 
            }}
        >
            <Tabs.Screen
            name="Category"
            options={{
                headerShown: false,
                    tabBarIcon: ({ color }) => <Feather name="search" size={30} color={color} />, 
                    tabBarLabel: "Category", 
            }}
            />
            <Tabs.Screen
                name="MainScreen"
                options={{
                    title: "MainScreen",
                    tabBarIcon: ({ color }) => <Feather name="home" size={30} color={color} />, 
                    tabBarLabel: "Home",
                }}
            />
            <Tabs.Screen
                name="Profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color }) => <Feather name="user" size={30} color={color} />, 
                }}
            />
        </Tabs>
      </GestureHandlerRootView>
  );
}
