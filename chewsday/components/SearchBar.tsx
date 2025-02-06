import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

interface SearchBarProps {
    placeholder?: string;
    containerStyle?: object;
}

interface Meal {
    idMeal: string;
    strMeal: string;
}

function SearchBar({ 
    placeholder = "Search",
    containerStyle = {}
}: SearchBarProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState<Meal[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (searchQuery.length > 0) {
                try {
                    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchQuery}`);
                    const data = await response.json();
                    if (data.meals) {
                        setSuggestions(data.meals.slice(0, 5));
                        setShowSuggestions(true);
                    } else {
                        setSuggestions([]);
                        setShowSuggestions(false);
                    }
                } catch (error) {
                    console.error('Error fetching suggestions:', error);
                }
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        };
        fetchSuggestions();
    }, [searchQuery]);

    return (
        <View style={[styles.searchContainer, containerStyle]}>
            <View style={styles.searchBar}>
                <TextInput 
                    style={styles.searchInput} 
                    placeholder={placeholder}
                    value={searchQuery} 
                    onChangeText={setSearchQuery}
                />
            </View>
            
            {showSuggestions && suggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                    {suggestions.map((meal) => (
                        <Link
                            key={meal.idMeal}
                            href={{
                                pathname: "/CuisineDetail/CuisineResult",
                                params: { id: meal.idMeal }
                            }}
                            style={styles.suggestionItem}
                        >
                            <Text>{meal.strMeal}</Text>
                        </Link>
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    searchContainer: {
        position: 'relative',
        zIndex: 1,
        marginBottom: 20,
        flex: 1,
    },
    searchBar: {
        height: 40,
        borderRadius: 20,
        backgroundColor: '#ece6f0',
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    searchInput: {
        height: '100%',
        fontSize: 16,
        color: '#49454f',
    },
    suggestionsContainer: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        marginTop: 5,
        maxHeight: 200,
        zIndex: 2,
    },
    suggestionItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
});

export default SearchBar;
