import { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, Linking, TouchableOpacity, Platform, Pressable, SafeAreaView, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { YELP_API_TOKEN } from "@/apiConfig";

const RestaurantDetail = () => {
    const { id } = useLocalSearchParams();
    const [restaurant, setRestaurant] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState<boolean>(false);
    const [ userToken, setUserToken ] = useState<string | null>(null);

    useEffect(() => {
        const fetchRestaurant = async () => {
            try {
                const response = await fetch(
                    `https://api.yelp.com/v3/businesses/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${YELP_API_TOKEN}`,
                        }
                    }
                );
                const data = await response.json();
                setRestaurant(data);
                await updateVisitRecord(data);
            } catch (error) {
                console.error('Error fetching restaurant:', error);
            } finally {
                setLoading(false);
            }
        };
        
        const updateVisitRecord = async (restaurantData: any) => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                if (!token) {
                    console.error('No token found');
                    return;
                }
        
                const response = await fetch('http://vcm-43365.vm.duke.edu:8888/api/profile/', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
        
                if (!response.ok) {
                    console.error('Failed to fetch user profile for email');
                    return;
                }
        
                const userData = await response.json();
                const email = userData.email;
        
                if (!email) {
                    console.error('User email not found!');
                    return;
                }
        
                const body = JSON.stringify({
                    email,
                    name: restaurantData.name,
                    categories: restaurantData.categories.map((cat: { title: string }) => cat.title),
                    rating: restaurantData.rating,
                });
        
                const visitResponse = await fetch(
                    `http://vcm-43365.vm.duke.edu:8888/api/top-restaurants/visit/${restaurantData.id}`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body,
                    }
                );
        
                if (!visitResponse.ok) {
                    const errorText = await visitResponse.text();
                    console.error('Failed to update visit record:', errorText);
                }
            } catch (error) {
                console.error('Error updating visit record:', error);
            }
        };
        
        fetchRestaurant();
        checkFavoriteStatus();
        checkUserToken();
    }, [id]);

    const handleFavorite = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                console.error('No token found');
                return;
            }
            const response = await fetch(`http://vcm-43365.vm.duke.edu:8888/api/profile/favorite/restaurant/${id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setIsFavorite(!isFavorite);
            } else {
                console.error('Failed to update favorite status');
            }
        } catch (error) {
            console.error('Error updating favorite status:', error);
        }
    };

    const checkFavoriteStatus = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) return;

            const response = await fetch('http://vcm-43365.vm.duke.edu:8888/api/profile/favorites', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            
            if (data.favoriteRestaurants) {
                setIsFavorite(data.favoriteRestaurants.includes(id));
            }
        } catch (error) {
            console.error('Error checking favorite status:', error);
        }
    };

    const checkUserToken = async() => {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          setUserToken(token);
        }
      };

    const openMaps = () => {
        const { latitude, longitude } = restaurant.coordinates;
        const scheme = Platform.select({
            ios: 'maps:',
            android: 'geo:',
        });
        const url = Platform.select({
            ios: `${scheme}?daddr=${latitude},${longitude}`,
            android: `${scheme}${latitude},${longitude}?q=${latitude},${longitude}`,
            default: `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
        });

        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                Linking.openURL(url);
            } else {
                const googleUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
                Linking.openURL(googleUrl);
            }
        });
    };

    if (loading) return <Text>Loading...</Text>;
    if (!restaurant) return <Text>Error loading restaurant details</Text>;

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Image 
                    source={{ uri: restaurant.image_url }} 
                    style={styles.image}
                />
                <View style={styles.infoContainer}>
                    <View style={styles.headerContainer}>
                        <Text style={styles.name}>{restaurant.name}</Text>
                        <View style={styles.buttonContainer}>
                            {userToken && (
                                <Pressable onPress={handleFavorite} style={styles.favoriteButton}>
                                <FontAwesome 
                                    name={isFavorite ? "heart" : "heart-o"} 
                                    size={24} 
                                    color={isFavorite ? "#ff4444" : "#666"} 
                                />
                            </Pressable>
                            )}
                            <Pressable onPress={openMaps} style={styles.navigationButton}>
                                <FontAwesome name="location-arrow" size={24} color="#007AFF" />
                            </Pressable>
                        </View>
                    </View>
                    <Text style={styles.details}>
                        {restaurant.rating} ★ • {restaurant.price} • 
                        {restaurant.categories?.map((cat: {title: string}) => cat.title).join(', ')}
                    </Text>
                    <Text style={styles.address}>
                        {restaurant.location?.display_address.join('\n')}
                    </Text>
                    {restaurant.hours?.[0]?.is_open_now && (
                        <Text style={styles.openNow}>Open Now</Text>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        width: '100%',
        backgroundColor: '#fff',
    },
    container: {
        flexGrow: 1,
    },
    scrollContainer: {
        //marginTop: 30,
    },
    image: {
        width: '100%',
        height: 200,
    },
    infoContainer: {
        padding: 16,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        flexWrap: 'wrap',
        maxWidth: '80%',
    },
    details: {
        fontSize: 16,
        color: '#666',
        marginBottom: 8,
    },
    address: {
        fontSize: 16,
        marginBottom: 8,
    },
    openNow: {
        color: 'green',
        fontWeight: 'bold',
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    buttonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    navigationButton: {
        padding: 8,
    },
    favoriteButton: {
        padding: 8,
        marginRight: 8,
    },
});

export default RestaurantDetail;
