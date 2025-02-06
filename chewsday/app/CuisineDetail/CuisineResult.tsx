import { Text, StyleSheet, SafeAreaView, ScrollView, View, Image, Pressable } from "react-native";
import { Link, useLocalSearchParams } from "expo-router";
import { useEffect, useState, useContext } from "react";
import { CurrLocationContext } from "@/hooks/CurrLocationContext";
import { RestaurantInfo } from "@/components/restaurantInfo";
import SearchBar from "@/components/SearchBar"; 
import FontAwesome from "@expo/vector-icons/FontAwesome";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { YELP_API_TOKEN } from "@/apiConfig";

function CuisineResult() {
    const { id } = useLocalSearchParams();
    const [cuisineName, setCuisineName] = useState<string>("");
    const [cuisineImage, setCuisineImage] = useState<string>("");
    const { CurrLocation, setCurrLocation } = useContext(CurrLocationContext);
    const [ restaurants, setRestaurants ] = useState<RestaurantInfo[]>([]);
    const [ isFavorite, setIsFavorite ] = useState<boolean>(false);
    const [ userToken, setUserToken ] = useState<string | null>(null);

    const handleFavorite = async () => {
      try {
          const token = await AsyncStorage.getItem('userToken');
          if (!token) {
              console.error('No token found');
              return;
          }
          const response = await fetch(`http://vcm-43365.vm.duke.edu:8888/api/profile/favorite/dish/${id}`, {
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
          
          if (data.favoriteDishes) {
              setIsFavorite(data.favoriteDishes.includes(id));
          }
      } catch (error) {
          console.error('Error checking favorite status:', error);
      }
  };

    const getCuisineResult = async () => {
      try {
        const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
        const response = await fetch(url);
        const data = await response.json();
        setCuisineName(data.meals[0].strMeal);
        setCuisineImage(data.meals[0].strMealThumb);
        console.log(cuisineName);
        console.log(cuisineImage);
      } catch (error) {
        console.error(error);
      }
    }

    const getRestaurantData = async () => {
      if (!CurrLocation) {
        console.error('Current location is null');
        return;
      }
      console.log('Current location:', CurrLocation);
      const url = `https://api.yelp.com/v3/businesses/search?latitude=${encodeURIComponent(CurrLocation.latitude)}&longitude=${encodeURIComponent(CurrLocation.longitude)}&term=${encodeURIComponent(cuisineName)}&sort_by=best_match&limit=5`;
      const token = YELP_API_TOKEN; 
    
      try {
        const response = await fetch(url, {
          method: 'GET', 
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json' 
          }
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        if (data && data.businesses) {
          const formattedData = data.businesses.map((business: any) => ({
              id: business.id,
              name: business.name,
              rating: business.rating, 
              image_url: business.image_url,
              location: business.location.address1,
          }));
          setRestaurants(formattedData);
          console.log('Restaurants:', restaurants);
      } else {
          console.error("Invalid data structure:", data);
      }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };    

    const checkUserToken = async() => {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        setUserToken(token);
      }
    };

    // First useEffect to get cuisine details
    useEffect(() => {
      getCuisineResult();
      checkFavoriteStatus();
      checkUserToken();
    }, [id]);

    // Second useEffect to get restaurant data when cuisineName changes
    useEffect(() => {
      if (cuisineName) {
        getRestaurantData();
      }
    }, [cuisineName, CurrLocation]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>

                <View style={styles.searchContainer}>
                    {/* Home button */}
                    <Link href="/MainScreen" style={styles.homeIcon}>
                        <FontAwesome name="home" size={24} color="#F2913D" />
                    </Link>

                    {/* Search Bar */}
                    <SearchBar />
                </View>

                {/* Preparation Methods */}
                
                <View style={{ marginBottom: 20, alignItems: 'center' }}>
                  <View style={styles.titleContainer}>
                    <Text style={styles.titleText}>{cuisineName}</Text>
                    {userToken && (
                      <Pressable onPress={handleFavorite} style={styles.favoriteButton}>
                          <FontAwesome 
                              name={isFavorite ? "heart" : "heart-o"} 
                              size={24} 
                              color={isFavorite ? "#ff4444" : "#666"} 
                          />
                      </Pressable>
                    )}
                  </View>
                  <View style={styles.divider} />
                  <Text style={styles.sectionTitle}>Preparation Methods</Text>
                  <View style={styles.prepMethodsBox}>
                    <Image 
                      source={{ uri: cuisineImage  ? cuisineImage : '../../assets/MainScreen/placeholder-image2.png' }}
                      style={styles.prepImage}
                      resizeMode='cover'
                    />
                    <Link href={{pathname: "/CuisineDetail/CookingMethod", params: { id: id }}} asChild>
                        <Pressable>
                          <Text style={{ color: "#007AFF", fontSize: 18 }}>learn details →</Text>
                        </Pressable>
                    </Link>
                  </View>
                </View>
                
                <View style={styles.divider} />
                {/* Restaurants List */}
                <View>
                  <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 16, alignSelf:'center' }}>
                    Restaurants
                  </Text>

                  {/* Individual Restaurant Item */}
                  {restaurants.map((restaurant, index) => (
                    <Link 
                      key={index} 
                      href={{
                        pathname: "/CuisineDetail/RestaurantDetail",
                        params: { id: restaurant.id }
                      }}
                      asChild
                    >
                      <Pressable style={styles.restaurantBox}>
                        <Image
                          source={{ uri: restaurant.image_url ? restaurant.image_url : '../../assets/MainScreen/placeholder-image2.png' }}
                          style={{ width: 50, height: 50, marginRight: 15}}
                        />
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 16, fontWeight: "bold" }}>{restaurant.name}</Text>
                          <Text style={{ color: "#666" }}>{restaurant.location}</Text>
                        </View>
                        <View style={styles.ratingContainer}>
                          <Text style={{ fontWeight: "bold", marginRight: 4 }}>{restaurant.rating}</Text>
                          <FontAwesome name="star" size={14} color="#F27F3D" />
                        </View>
                      </Pressable>
                    </Link>
                  ))}
                </View>
                <Link href={{pathname: "/CuisineDetail/CookingMethod"}}></Link>
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
    scrollContainer: {
      marginTop: 30,
      padding: 16,
      paddingBottom: 200,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center', 
      width: '100%',
    },
    homeIcon: {
      marginRight: 8,
      paddingBottom: 20,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    prepMethodsBox: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      alignItems: 'center',
      backgroundColor: '#f9f9f9',
      width: '100%',
      minHeight:'22%',
      borderRadius: 10,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 5,
      elevation: 5,
    },
    restaurantBox: {
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

    prepImage: {
      width: 150,
      height: 150,
      borderRadius: 10,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
  },
  titleText: {
      fontSize: 24,
      fontWeight: 'bold',
      marginRight: 10,
  },
  sectionTitle: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 12,
  },
  favoriteButton: {
      padding: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#d3d3d3',
    marginBottom: 10,
},
});

export default CuisineResult;
