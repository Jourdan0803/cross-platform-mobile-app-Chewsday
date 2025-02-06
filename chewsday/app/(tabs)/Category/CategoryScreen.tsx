import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Link } from 'expo-router';
import SearchBar from '@/components/SearchBar';

type Category = {
  id: string;
  name: string;
  image: string;
};

const CategoryScreen: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<'Categories' | 'Area' | 'Ingredients'>('Categories');
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchData();
  }, [selectedFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (selectedFilter === 'Categories') {
        await fetchCategories();
      } else if (selectedFilter === 'Area') {
        await fetchAreas();
      } else if (selectedFilter === 'Ingredients') {
        await fetchIngredients();
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    const response = await fetch('https://www.themealdb.com/api/json/v1/1/categories.php');
    const data = await response.json();
    const categories = data.categories.map((item: any) => ({
      id: item.idCategory,
      name: item.strCategory,
      image: item.strCategoryThumb,
    }));
    setItems(categories);
  };

  const fetchAreas = async () => {
    const response = await fetch('https://www.themealdb.com/api/json/v1/1/list.php?a=list');
    const data = await response.json();
    const areaList = data.meals.map((item: { strArea: string }) => item.strArea);

    const areaItems = await Promise.all(
      areaList.map(async (area: string, index: number) => {
        const areaResponse = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${encodeURIComponent(area)}`);
        const areaData = await areaResponse.json();
        const firstMeal = areaData.meals ? areaData.meals[0] : null;
        return {
          id: index.toString(),
          name: area,
          image: firstMeal ? firstMeal.strMealThumb : '',
        };
      })
    );
    setItems(areaItems);
  };

  
  const fetchIngredients = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://www.themealdb.com/api/json/v1/1/list.php?i=list');
      const data = await response.json();
      
      const ingredientItems = data.meals.map((item: any, index: number) => ({
        id: index.toString(), 
        name: item.strIngredient, 
        image: `https://www.themealdb.com/images/ingredients/${encodeURIComponent(item.strIngredient)}-Small.png`, // 构造小图片 URL
      }));
      
      setItems(ingredientItems); 
    } catch (error) {
      console.error('Error fetching ingredients:', error);
    } finally {
      setLoading(false);
    }
  };
  
  

  const renderItem = ({ item }: { item: Category }) => (
    <TouchableOpacity style={styles.categoryContainer}>
      <Link
        href={{
          pathname: "/Category/CategoryDetailScreen",
          params: {
            selectedFilter,
            name: item.name,
          },
        }}
        asChild
      >
        <Pressable>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.categoryImage} />
          ) : (
            <View style={[styles.categoryImage, styles.placeholderImage]}>
              <Text>No Image</Text>
            </View>
          )}
          <Text style={styles.categoryText}>{item.name}</Text>
        </Pressable>
      </Link>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={{marginBottom: 40}}>
            <SearchBar />
          </View>
          
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[styles.filterButton, selectedFilter === 'Categories' && styles.selectedFilterButton]}
              onPress={() => setSelectedFilter('Categories')}
            >
              <Text style={styles.filterText}>Categories</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, selectedFilter === 'Area' && styles.selectedFilterButton]}
              onPress={() => setSelectedFilter('Area')}
            >
              <Text style={styles.filterText}>Area</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, selectedFilter === 'Ingredients' && styles.selectedFilterButton]}
              onPress={() => setSelectedFilter('Ingredients')}
            >
              <Text style={styles.filterText}>Ingredients</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <FlatList
              data={items}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              numColumns={2}
            />
          )}
        </View>
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
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    marginTop: 46,
  },
  filterContainer: {
    flexDirection: 'row',
    marginVertical: 10,
    justifyContent: 'space-around',
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#eee',
    borderRadius: 5,
  },
  selectedFilterButton: {
    backgroundColor: '#ccc',
  },
  filterText: {
    fontSize: 16,
  },
  categoryContainer: {
    flex: 1,
    alignItems: 'center',
    marginBottom: 20,
    marginHorizontal: 5,
  },
  categoryImage: {
    width: 150,
    height: 100,
    borderRadius: 10,
  },
  placeholderImage: {
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    width: 150,
    height: 100,
    borderRadius: 10,
  },
  categoryText: {
    fontSize: 16,
    marginTop: 5,
  },
});

export default CategoryScreen;
