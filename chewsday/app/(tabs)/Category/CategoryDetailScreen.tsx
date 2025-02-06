import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Link, useLocalSearchParams } from "expo-router";

type Meal = {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
};

const CategoryDetailScreen: React.FC = () => {
  const { selectedFilter, name } = useLocalSearchParams<{
    selectedFilter: string;
    name: string;
  }>();
  console.log("the Filter is:", selectedFilter);
console.log("the name is:",name);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (selectedFilter && name) {
      fetchMeals();
    }
  }, [selectedFilter, name]);

  const fetchMeals = async () => {
    setLoading(true);
    try {
      await fetchWithRetry();
    } catch (error) {
      console.error("Error fetching meals:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchWithRetry = async (retries = 1) => {
    try {
      let url = "";
      if (selectedFilter === "Categories") {
        url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(
          name as string
        )}`;
      } else if (selectedFilter === "Area") {
        url = `https://www.themealdb.com/api/json/v1/1/filter.php?a=${encodeURIComponent(
          name as string
        )}`;
      } else if (selectedFilter === "Ingredients") {
        url = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(
          name as string
        )}`;
      }
  
      console.log("Fetching URL:", url);
      const response = await fetch(url);
  
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        setMeals(data.meals || []);
      } else {
        const rawText = await response.text();
        console.error("Non-JSON response received:", rawText);
        setMeals([]);
        throw new Error("Non-JSON response received");
      }
    } catch (error) {
      if (retries > 0) {
        console.log("Retrying fetch...");
        await new Promise((resolve) => setTimeout(resolve, 1000)); 
        return fetchWithRetry(retries - 1);
      } else {
        throw error; 
      }
    }
  };
  
  
  const renderMeal = ({ item }: { item: Meal }) => (
    <TouchableOpacity style={styles.mealContainer}>
      <Link
        href={{
          pathname: "/CuisineDetail/CuisineResult",
          params: { id: item.idMeal },
        }}
        asChild
      >
        <Pressable>
          <Image source={{ uri: item.strMealThumb }} style={styles.mealImage} />
          <Text style={styles.mealText}>{item.strMeal}</Text>
        </Pressable>
      </Link>
    </TouchableOpacity>
  );

  if (!selectedFilter || !name) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>cannot fetch data</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{name} Meal</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : meals.length > 0 ? (
        <FlatList
          data={meals}
          renderItem={renderMeal}
          keyExtractor={(item) => item.idMeal}
          numColumns={2}
        />
      ) : (
        <Text style={styles.noMealsText}>no meal</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  mealContainer: {
    flex: 1,
    margin: 8,
    alignItems: "center",
  },
  mealImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
  },
  mealText: {
    marginTop: 8,
    fontSize: 16,
  },
  noMealsText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
  },
});

export default CategoryDetailScreen;
