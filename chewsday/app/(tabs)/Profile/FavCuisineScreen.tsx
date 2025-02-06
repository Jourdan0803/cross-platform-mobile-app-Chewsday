import React, { useState } from "react";
import { View, Text, StyleSheet, Image, Pressable, ScrollView, SafeAreaView } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link } from "expo-router"
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

interface Cuisine {
  id: string;
  name: string;
  image: string;
}

const FavCuisineScreen: React.FC = () => {
  const [favoriteCuisines, setFavoriteCuisines] = useState<Cuisine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      fetchFavorites(); 
    }, [])
  );

  const fetchCuisineDetails = async (id: string) => {
    try {
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
      const data = await response.json();
      if (data.meals && data.meals[0]) {
        return {
          id,
          name: data.meals[0].strMeal,
          image: data.meals[0].strMealThumb
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching cuisine details:', error);
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
      
      if (data.favoriteDishes && data.favoriteDishes.length > 0) {
        const cuisinePromises = data.favoriteDishes.map(fetchCuisineDetails);
        const cuisines = await Promise.all(cuisinePromises);
        setFavoriteCuisines(cuisines.filter(cuisine => cuisine !== null));
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (favoriteCuisines.length === 0) {
    return (
      <View style={styles.container}>
        <View style={{ position: 'relative' }}>
          <FontAwesome name="circle" size={98} color="#f2913D" />
          <FontAwesome name="book" size={50} color="#fff" style={{ position: 'absolute', top: 20, left:15 }} />
        </View>
        <Text style={styles.noCuisineText}>No favorite cuisine</Text>
        <Link href="/Category/CategoryScreen" asChild>
          <Pressable style={styles.findButton}>
            <Text style={styles.findButtonText}>Find a cuisine</Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}> 
        <ScrollView style={styles.scrollContainer}>
          <View style={styles.gridContainer}>
            {favoriteCuisines.map((cuisine) => (
              <Link 
                key={cuisine.id}
                href={{
                  pathname: "/CuisineDetail/CuisineResult",
                  params: { id: cuisine.id }
                }}
                asChild
              >
                <Pressable style={styles.cuisineCard}>
                  <Image 
                    source={{ uri: cuisine.image }} 
                    style={styles.cuisineImage}
                  />
                  <Text style={styles.cuisineName}>{cuisine.name}</Text>
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
  cuisineCard: {
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
  cuisineImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  cuisineName: {
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

export default FavCuisineScreen;