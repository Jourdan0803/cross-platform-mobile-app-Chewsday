import React, { useState, useEffect } from 'react';
import { View, Dimensions, Image, StyleSheet } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';

const { width: screenWidth } = Dimensions.get('window');

const AutoCarousel = () => {
  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchImages = async () => {
      // const url = `https://www.themealdb.com/api/json/v1/1/search.php?f=a`;
      const url = `https://www.themealdb.com/api/json/v2/9973533/randomselection.php`;
      try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.meals) {
          const fetchedImages = data.meals.slice(0, 5).map((meal) => ({
            id: meal.idMeal,
            url: meal.strMealThumb,
          }));
          setImages(fetchedImages);
        }
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    };

    fetchImages();
  }, []);

  const renderItem = ({ item }: { item: { id: string; url: string } }) => (
    <View style={styles.slide}>
      <Image source={{ uri: item.url }} style={styles.image} />
    </View>
  );

  return (
    <Carousel
      data={images}
      renderItem={renderItem}
      width={screenWidth}
      height={200}
      autoPlay
      autoPlayInterval={3000}
    />
  );
};

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 0.92 * screenWidth,
    height: 200,
    resizeMode: 'cover',
    borderRadius: 10,
  },
});

export default AutoCarousel;
