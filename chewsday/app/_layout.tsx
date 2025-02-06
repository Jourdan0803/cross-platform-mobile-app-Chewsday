import React from "react";
import { Stack } from "expo-router";
import { useEffect, useContext } from "react";
import * as Location from 'expo-location';
import { useCurrLocation } from "@/hooks/useCurrLocation";
import { CurrLocationContext } from "@/hooks/CurrLocationContext";

export default function RootLayout() {
    const [ CurrLocation, setCurrLocation ] = useCurrLocation();

    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Permission to access location was denied, set default location to Durham, NC');
                setCurrLocation({
                    latitude: 35.9940,
                    longitude: -78.8986,
                });
                return;
            }
            const loc = await Location.getCurrentPositionAsync({});
            console.log('latitude', loc.coords.latitude);
            console.log('longitude', loc.coords.longitude);
            setCurrLocation({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
            });
            console.log('CurrLocation:', CurrLocation);
        })();
        }, []);

    return (
        <CurrLocationContext.Provider value={{ CurrLocation, setCurrLocation }}>
            <Stack screenOptions={{
                headerShown: false,
            }}  >
                <Stack.Screen
                    name="(tabs)"
                    options={{
                        title: "Tabs",
                    }}
                />
                <Stack.Screen
                    name="CuisineDetail"
                    options={{
                        title: "CuisineDetail",
                    }}
                />
            </Stack>
        </CurrLocationContext.Provider>
    );
}
  