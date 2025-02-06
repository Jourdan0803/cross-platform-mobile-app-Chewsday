import { useState, useEffect } from "react";
import { Text, StyleSheet, SafeAreaView, View, Image, Pressable, ScrollView, Linking } from "react-native";
import { Link, useLocalSearchParams } from "expo-router";
import SearchBar from "@/components/SearchBar";
import FontAwesome from "@expo/vector-icons/FontAwesome";

interface Ingredient {
  name: string;
  measure: string;
}

const CookingMethod = () => {
    const { id } = useLocalSearchParams();
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [instructions, setInstructions] = useState<string[]>([]);
    const [youtubeUrl, setYoutubeUrl] = useState("");
    const [ thumbnailUrl, setThumbnailUrl ] = useState("");

    const getYoutubeVideoId = (url: string) => {
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[7].length === 11) ? match[7] : false;
    };

    const handleTutorialPress = async () => {
        if (youtubeUrl) {
          try {
            const supported = await Linking.canOpenURL(youtubeUrl);
            if (supported) {
                await Linking.openURL(youtubeUrl);
            } else {
                console.log("Can't open this URL: " + youtubeUrl);
            }
          } catch (error) {
            console.error("An error occurred while opening the URL: " + error);
          }
        }
    };
    const [meal, setMeal] = useState<any>(null); 
    useEffect(() => {
      const fetchMealDetails = async () => {
          try {
              const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
              const data = await response.json();
              const meal= data.meals[0];
              setMeal(meal);

              // Extract YouTube URL and thumbnail URL
              if (meal.strYoutube) {
                  setYoutubeUrl(meal.strYoutube);
                  const videoId = getYoutubeVideoId(meal.strYoutube);
                  if (videoId) {
                      setThumbnailUrl(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);
                  }
              }

              // Extract ingredients and measures
              const extractedIngredients: Ingredient[] = [];
              for (let i = 1; i <= 20; i++) {
                  const ingredient = meal[`strIngredient${i}`];
                  const measure = meal[`strMeasure${i}`];
                  if (ingredient && ingredient.trim() !== "") {
                      extractedIngredients.push({
                          name: ingredient,
                          measure: measure
                      });
                  }
              }
              setIngredients(extractedIngredients);

              // Split instructions into steps
              setInstructions(meal.strInstructions.split('\r\n').filter(Boolean));
          } catch (error) {
              console.error('Error fetching meal details:', error);
          }
      };
      if (id) {
          fetchMealDetails();
      }
    }, [id]);
  
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
                <View style={styles.restaurantCard}>
                    <View style={styles.rowContainer}>
                        <Text style={styles.sectionTitle} numberOfLines={3}>{meal?.strMeal}</Text>
                        <Pressable style={styles.tutorialButton} onPress={handleTutorialPress}>
                            <View style={styles.tutorialContent}>
                                <FontAwesome name="play-circle" size={24} color="white" style={{ marginRight: 10 }} />
                                <Text style={styles.tutorialText}>Watch Video</Text>
                            </View>
                        </Pressable>
                    </View>
                    <Image 
                        source={{ uri: thumbnailUrl ? thumbnailUrl : "../../assets/MainScreen/placeholder-image2.png" }}
                        style={styles.tutorialImage}
                    />
                </View>
                {/* Ingredients Section */}
                <Text style={styles.sectionTitle}>Ingredients</Text>
                <View style={styles.ingredientsList}>
                    {ingredients.map((ingredient, index) => (
                        <View key={index} style={styles.ingredientItem}>
                            <Text style={{fontSize: 18}}>{ingredient.name}: {ingredient.measure}</Text>
                        </View>
                    ))}
                </View>

                {/* Cooking Steps Section */}
                <Text style={styles.sectionTitle}>Cooking Steps</Text>
                <View style={styles.stepsContainer}>
                    {instructions.map((step, index) => (
                        <Text key={index} style={styles.stepText}>{step}</Text>
                    ))}
                </View>


            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContainer: {
        marginTop: 30,
        marginBottom: 30,
        padding: 16,
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
    searchBar: {
        backgroundColor: '#F5F5F5',
        borderRadius: 20,
        padding: 10,
        marginBottom: 20,
    },
    searchInput: {
        fontSize: 16,
    },
    sectionTitle: {
        alignSelf: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        marginTop: 10,
        flexShrink: 1,
        flexWrap: 'wrap',
        maxWidth: 200,
        textAlign: 'center'
    },
    ingredientsList: {
        gap: 10,
        marginBottom: 20,
    },
    ingredientItem: {
        backgroundColor: '#F8F8F8',
        padding: 15,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    stepsContainer: {
        backgroundColor: '#F8F8F8',
        padding: 15,
        borderRadius: 15,
        gap: 10,
        marginBottom: 20,
    },
    tutorialButton: {
        flexDirection: 'row',
        // alignItems: 'center',
        backgroundColor: '#F27F3D',
        padding: 8,
        borderRadius: 15,
        alignSelf: 'flex-end',
    },
    tutorialContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tutorialText: {
        fontSize: 15,
        color: 'white',
        marginRight: 10,
    },
    tutorialImage: {
        width: 140,
        height: 140,
        borderRadius: 10,
    },
    restaurantCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderRadius: 10,
        backgroundColor: '#f9f9f9',
        padding: 10,
        // alignItems: 'center',
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5, // For Android shadow
    },
    stepText: {
      fontSize: 18,
      marginBottom: 10,
      lineHeight: 20,
    },
    buttonContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rowContainer: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
});

export default CookingMethod;
