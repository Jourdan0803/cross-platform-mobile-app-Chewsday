import { Text, StyleSheet, SafeAreaView, View, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import React, { useState, useEffect, useContext } from 'react';
import SearchBar from '@/components/SearchBar';
import { CurrLocationContext } from '@/hooks/CurrLocationContext';
import { YELP_API_TOKEN } from '@/apiConfig';
import { DishInfo } from '@/components/DishInfo';
import { RestaurantInfo } from '@/components/restaurantInfo';
import AutoCarousel from '@/components/AutoCarousel';
import AsyncStorage from '@react-native-async-storage/async-storage';


function MainScreen() {
    const { CurrLocation } = useContext(CurrLocationContext);
    const [ popularDishes, setPopularDishes] = useState<DishInfo[]>([]);
    const [ latestDishes, setLatestDishes] = useState<DishInfo[]>([]);
    const [ topRestaurants, setTopRestaurants] = useState<RestaurantInfo[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!CurrLocation) {
                return;
            }
    
            try {
                const token = await AsyncStorage.getItem('userToken');
    
                if (!token) {
                    await fetchTopRestaurants();
                } else {
                    await fetchTopRestaurantsWithGPT();
                }
    
                await fetchPopularDishes();
                await fetchLatestDishes();
            } catch (error) {
                console.error('Error in fetching data:', error);
            }
        };
    
        fetchData();
    }, [CurrLocation]);
    

    const fetchPopularDishes = async () => {
        const url = `https://www.themealdb.com/api/json/v2/9973533/randomselection.php`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            setPopularDishes(data.meals.slice(0, 3) || []);
        } catch (error) {
            console.error('Error fetching popular dishes:', error);
        }
    };

    const fetchLatestDishes = async () => {
        const url = `https://www.themealdb.com/api/json/v2/9973533/latest.php`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            setLatestDishes(data.meals.slice(0, 3) || []);
        } catch (error) {
            console.error('Error fetching latest dishes:', error);
        }
    };
    
    const fetchTopRestaurants = async () => {
        if (!CurrLocation) {
            console.error('CurrLocation is null');
            return;
        }
        const url = `https://api.yelp.com/v3/businesses/search?latitude=${encodeURIComponent(CurrLocation.latitude)}&longitude=${encodeURIComponent(CurrLocation.longitude)}&term=restaurant&sort_by=rating&limit=5`;
        try {
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${YELP_API_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            setTopRestaurants(data.businesses || []);
        } catch (error) {
            console.error('Error fetching top restaurants:', error);
        }
    };

    const fetchTopRestaurantsWithGPT = async () => {
        if (!CurrLocation) {
            console.error('CurrLocation is null');
            return;
        }
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                console.error('No token found');
                return;
            }
    
            const profileResponse = await fetch('http://vcm-43365.vm.duke.edu:8888/api/profile/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
    
            if (!profileResponse.ok) {
                console.error('Failed to fetch user profile for email');
                return;
            }
    
            const userData = await profileResponse.json();
            const email = userData.email;
    
            if (!email) {
                console.error('User email not found!');
                return;
            }
    
            const response = await fetch(
                `http://vcm-43365.vm.duke.edu:8888/api/top-restaurants?latitude=${CurrLocation.latitude}&longitude=${CurrLocation.longitude}&email=${email}`
            );
    
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error fetching top restaurants with GPT:', errorText);
                return;
            }
    
            const data = await response.json();
            setTopRestaurants(data.businesses || []);
        } catch (error) {
            console.error('Error fetching top restaurants with GPT:', error);
        }
    };
    

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <SearchBar />

                <View style={styles.largeImageContainer}>
                    <AutoCarousel />
                </View>

                <View style={styles.divider} />

                {/* Top Popular Dishes */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Top Popular Dishes</Text>
                    <View style={styles.imageRow}>
                        {popularDishes.map((dish, index) => (
                            <Link key={index} href={{ pathname: "/CuisineDetail/CuisineResult", params: { id: dish.idMeal }}} asChild>
                                <TouchableOpacity style={styles.imageContainer}>
                                    <Image source={{ uri: dish.strMealThumb }} style={styles.popularImage} />
                                    <Text style={styles.dishName} numberOfLines={1}>{dish.strMeal}</Text>
                                </TouchableOpacity>
                            </Link>
                        ))}
                    </View>
                </View>

                <View style={styles.divider} />

                {/* Latest Dishes */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Latest Dishes</Text>
                    <View style={styles.imageRow}>
                        {latestDishes.map((dish, index) => (
                            <Link key={index} href={{ pathname: "/CuisineDetail/CuisineResult", params: { id: dish.idMeal }}} asChild>
                                <TouchableOpacity style={styles.imageContainer}>
                                    <Image source={{ uri: dish.strMealThumb }} style={styles.latestImage} />
                                    <Text style={styles.dishName} numberOfLines={1}>{dish.strMeal}</Text>
                                </TouchableOpacity>
                            </Link>
                        ))}
                    </View>
                </View>

                <View style={styles.divider} />

             {/* Top Restaurants */}
             <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Top Restaurants</Text>
                    </View>
                    {topRestaurants.map((restaurant, index) => (
                        <TouchableOpacity key={index} style={styles.restaurantCard}>
                            <Image source={{ uri: restaurant?.image_url ? restaurant?.image_url : '../../assets/MainScreen/placeholder-image1.png'}} style={styles.restaurantImage} />
                            <View style={styles.restaurantInfo}>
                                <Text style={styles.restaurantName}>{restaurant?.name}</Text>
                                <Text style={styles.restaurantDetails}>{`${restaurant?.price || ''} ${restaurant?.categories[0]?.title || ''} ${restaurant?.rating} ★`}</Text>
                            </View>
                            <View style={{ justifyContent: 'center' }}>
                                <TouchableOpacity style={styles.detailsButton}>
                                    <Link href={{ pathname: "/CuisineDetail/RestaurantDetail", params: { id: restaurant?.id } }}>
                                        <Text style={{ color: 'white' }}>Details</Text>
                                    </Link>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        width: '100%',
        backgroundColor: '#fff',
    },
    scrollContainer: {
        marginTop: 30,
        padding: 16,
    },
    largeImageContainer: {
        marginBottom: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    largeImage: {
        width: '90%',
        height: 200,
        borderRadius: 10,
    },
    section: {
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    imageRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    imageContainer: {
        flex: 1,
        marginHorizontal: 5,
    },
    popularImage: {
        width: '100%',
        height: 100,
        borderRadius: 10,
    },
    latestImage: {
        width: '100%',
        height: 100,
        borderRadius: 10,
    },
    dishName: {
        textAlign: 'center',
        marginTop: 5,
        fontSize: 14,
    },
    restaurantCard: {
        flexDirection: 'row',
        borderRadius: 10,
        backgroundColor: '#f9f9f9',
        padding: 10,
        alignItems: 'center',
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5, // For Android shadow
    },
    restaurantImage: {
        width: 80,
        height: 80,
        borderRadius: 10,
        marginRight: 10,
    },
    restaurantInfo: {
        flex: 1,
    },
    restaurantName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    restaurantDetails: {
        color: '#666',
        fontSize: 14,
        marginVertical: 4,
    },
    detailsButton: {
        backgroundColor: '#BF3604',
        padding: 8,
        borderRadius: 15,
        alignSelf: 'flex-start',
    },
    divider: {
        height: 1,
        backgroundColor: '#d3d3d3',
        marginBottom: 10,
    },
});

export default MainScreen;
