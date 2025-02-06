import React, { useState } from "react";
import { View, Text, StyleSheet, Image, ScrollView, Pressable, SafeAreaView } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { YELP_API_TOKEN } from "@/apiConfig";

interface Restaurant {
  id: string;
  name: string;
  image_url: string;
}

const FavRestaurantScreen: React.FC = () => {
  const [favoriteRestaurants, setFavoriteRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRestaurantDetails = async (id: string) => {
    try {
      const response = await fetch(`https://api.yelp.com/v3/businesses/${id}`, {
        headers: {
          'Authorization': `Bearer ${YELP_API_TOKEN}`
        }
      });
      const data = await response.json();
      return {
        id: data.id,
        name: data.name,
        image_url: data.image_url
      };
    } catch (error) {
      console.error('Error fetching restaurant details:', error);
      return null;
    }
  };

  const fetchFavorites = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch('http://vcm-43365.vm.duke.edu:8888/api/profile/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.favoriteRestaurants && data.favoriteRestaurants.length > 0) {
        const restaurantPromises = data.favoriteRestaurants.map(fetchRestaurantDetails);
        const restaurants = await Promise.all(restaurantPromises);
        setFavoriteRestaurants(restaurants.filter(restaurant => restaurant !== null));
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setIsLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchFavorites(); 
    }, [])
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (favoriteRestaurants.length === 0) {
    return (
      <View style={styles.container}>
        <View style={{ position: 'relative' }}>
          <FontAwesome name="circle" size={98} color="#f2913D" />
          <FontAwesome name="book" size={50} color="#fff" style={{ position: 'absolute', top: 20, left:15 }} />
        </View>
        <Text style={styles.noCuisineText}>No favorite restaurant</Text>
        <Link href="/Category/CategoryScreen" asChild>
          <Pressable style={styles.findButton}>
            <Text style={styles.findButtonText}>Find a restaurant</Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollContainer}>
          <View style={styles.gridContainer}>
            {favoriteRestaurants.map((restaurant) => (
              <Link 
                key={restaurant.id}
                href={{
                  pathname: "/CuisineDetail/RestaurantDetail",
                  params: { id: restaurant.id }
                }}
                asChild
              >
                <Pressable style={styles.restaurantCard}>
                  <Image 
                    source={{ uri: restaurant.image_url }} 
                    style={styles.restaurantImage}
                  />
                  <Text style={styles.restaurantName}>{restaurant.name}</Text>
                </Pressable>
              </Link>
            ))}
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
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  scrollContainer: {
    marginTop: 10,
    padding: 16,
  },
  gridContainer: {
    padding: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  restaurantCard: {
    width: '48%',
    marginBottom: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  restaurantImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  restaurantName: {
    padding: 10,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  noCuisineText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  findButton: {
    backgroundColor: "#A0522D",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  findButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default FavRestaurantScreen;