import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, SafeAreaView, ScrollView, Image, Alert, Modal, TextInput, Button } from 'react-native';
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, useRouter } from "expo-router"
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import * as ImagePicker from 'expo-image-picker'; 
import Fontisto from '@expo/vector-icons/Fontisto';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface UserProfile {
  username: string;
  email?: string;
  phone?: string;
  photo?: string;
}

const ProfileScreen = () => {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newPhone, setNewPhone] = useState('');

  useEffect(() => {
    checkAuth();
    fetchUserProfile();
  }, []);

  const checkAuth = async () => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      router.replace('/Profile/LoginScreen');
    }
  };

  const fetchUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const response = await fetch('http://vcm-43365.vm.duke.edu:8888/api/profile/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const photo = await AsyncStorage.getItem('userPhoto');
        setUserProfile({
          username: data.username,
          email: data.email,
          phone: data.phone,
          photo: photo || undefined
        });
      } else {
        console.error('Failed to fetch user profile');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    //await AsyncStorage.removeItem('userPhoto');
    router.replace('/Profile/LoginScreen');
  };

  const handleImageUpload = async () => {
    const choice = await showImagePickerOptions();
    if (!choice) return;
  
    let result;
  
    if (choice === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'You need to grant camera permissions to upload an image');
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });
    } else if (choice === 'gallery') {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });
    }
  
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;
  
      const base64 = await fetch(uri)
        .then((response) => response.blob())
        .then((blob) => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve(reader.result as string);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        });
  
      await AsyncStorage.setItem('userPhoto', base64);
  
      setUserProfile((prevProfile) => ({
        ...prevProfile,
        photo: base64,
        username: prevProfile?.username || '',
        email: prevProfile?.email || '',
        phone: prevProfile?.phone || '',
      }));
    }
  };

  const showImagePickerOptions = async () => {
    return new Promise((resolve) => {
      Alert.alert(
        'Select Image',
        'Choose the source for your image',
        [
          {
            text: 'Cancel',
            onPress: () => resolve(null),
            style: 'cancel',
          },
          {
            text: 'Take Photo',
            onPress: () => resolve('camera'),
          },
          {
            text: 'Choose from Gallery',
            onPress: () => resolve('gallery'),
          },
        ],
        { cancelable: true }
      );
    });
  };

  const handlePhonePress = () => {
    setModalVisible(true);
  };

  const handleSavePhone = async () => {
    console.log('New phone number:', newPhone);
    const token = await AsyncStorage.getItem('userToken'); 
        try {
            const response = await fetch('http://vcm-43365.vm.duke.edu:8888/api/profile/upload/phone', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ phone: newPhone }), 
            });

            if (!response.ok) {
                console.error('Failed to upload phone number');
                Alert.alert('Error', 'Failed to upload phone number');
            } else {
                setUserProfile(prevProfile => ({
                    ...prevProfile,
                    username: prevProfile?.username || '', 
                    email: prevProfile?.email || '',      
                    phone: newPhone,      
                    photo: prevProfile?.photo || undefined
                }));
                Alert.alert('Success', 'Phone number updated successfully');
            }
        } catch (error) {
            console.error('Error uploading phone number:', error);
            Alert.alert('Error', 'An error occurred while uploading the phone number');
        } finally {
            setModalVisible(false); 
        }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollContainer}>
          <View style={styles.header}>
            <Pressable onPress={handleImageUpload}>
            {userProfile?.photo ? (
                            <Image 
                                source={{ uri: userProfile.photo }} 
                                style={styles.profileImage} 
                            />
                        ) : (
                            <FontAwesome5 name="user-circle" size={90} color="#f2913D" />
                        )}
            </Pressable>
            <Text style={styles.username}>{userProfile?.username || 'Username'}</Text>
          </View>
          <View style={styles.buttonsContainer}>
            <Link href={{pathname: "/Profile/FavCuisineScreen" }} asChild>
              <Pressable style={styles.button}>
                <FontAwesome name="heart" size={24} color="red" />
                <Text style={styles.buttonText}>Favorite Dishes</Text>
              </Pressable>
            </Link>
            <Link href={{pathname: "/Profile/FavRestaurantScreen" }} asChild>
              <Pressable style={styles.button}>
                <FontAwesome name="star" size={24} color="#ff751a" />
                <Text style={styles.buttonText}>Favorite Restaurants</Text>
              </Pressable>
            </Link>
          </View>

          <View style={styles.profileSection}>
            <Text style={styles.sectionTitle}>Profile</Text>
            <View style={styles.profileItem}>
              <Fontisto name="email" size={30} color="black" />
              <Text style={styles.profileText}>{userProfile?.email || 'Email'}</Text>
            </View>
            <Pressable style={styles.profileItem} onPress={handlePhonePress}>
              <Feather name="phone" size={30} color="black" />
              <Text style={styles.profileText}>{userProfile?.phone || 'Upload phone number'}</Text>
            </Pressable>
            <Pressable style={styles.profileItem} onPress={handleLogout}>
              <MaterialIcons name="logout" size={30} color="red" />
              <Text style={[styles.profileText, { color: 'red' }]}>Logout</Text>
            </Pressable>
          </View>
        </ScrollView>

        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
        >
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ width: 300, padding: 20, backgroundColor: 'white', borderRadius: 10 }}>
                    <Text>Enter your new phone number:</Text>
                    <TextInput
                        value={newPhone}
                        onChangeText={setNewPhone}
                        placeholder="Phone Number"
                        keyboardType="phone-pad"
                        style={{ borderWidth: 1, borderColor: 'gray', marginVertical: 10, padding: 10 }}
                    />
                    <Button title="Save" onPress={handleSavePhone} />
                    <Button title="Cancel" onPress={() => setModalVisible(false)} />
                </View>
            </View>
        </Modal>
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
    marginTop: 60,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 45,
    marginBottom: 10,
  },
  buttonsContainer: {
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonText: {
    marginLeft: 10,
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 15,
  },
  profileText: {
    marginLeft: 10,
    fontSize: 20,
  },
});

export default ProfileScreen;