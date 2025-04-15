import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useProducts } from "@/context/ProductContext";
import { router } from "expo-router";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, FlatList, Image, Alert, ActivityIndicator, Platform } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { ProductType } from "@/interfaces/common";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CashierScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ProductType>("starter");
  const [price, setPrice] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { logout } = useAuth();
  const { products, addProduct, deleteProduct, pickImage, takePhoto } = useProducts();

  const handleSaveProduct = async () => {
    if (!title || !price) {
      Alert.alert("Error", "Please complete at least the title and price");
      return;
    }

    setIsLoading(true);
    try {
      await addProduct(
        { title, description, type, price },
        photoUri || null
      );
      
      setTitle("");
      setDescription("");
      setType("starter");
      setPrice("");
      setPhotoUri(null);
      
      Alert.alert("Success", "Product saved successfully");
    } catch (error) {
      Alert.alert("Error", "Could not save the product");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    setIsLoading(true);
    try {
      await deleteProduct(id);
      Alert.alert("Success", "Product deleted successfully");
    } catch (error) {
      Alert.alert("Error", "Could not delete the product");
      console.error("Error deleting:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/auth");
    } catch (error) {
      Alert.alert("Error", "Could not log out");
      console.error("Error logging out:", error);
    }
  };

  const handleTakePhoto = async () => {
    if (Platform.OS === 'web') {
      const file = await new Promise<File | null>((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment';
        input.onchange = () => resolve(input.files?.[0] || null);
        input.click();
      });

      if (file) {
        const webUri = URL.createObjectURL(file);
        setPhotoUri(webUri);
        return webUri;
      }
      return undefined;
    } else {
      const uri = await takePhoto();
      if (uri) setPhotoUri(uri);
      return uri;
    }
  };

  const handlePickImage = async () => {
    try {
      const uri = await pickImage();
      if (uri) setPhotoUri(uri);
    } catch (error) {
      Alert.alert("Error", "Could not access the gallery");
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>🧾 Add Product</Text>

      <View style={styles.photoSection}>
        {photoUri ? (
          <View style={styles.imagePreview}>
            <Image source={{ uri: photoUri }} style={styles.image} />
            <TouchableOpacity 
              style={styles.removePhotoButton} 
              onPress={() => setPhotoUri(null)}
            >
              <Text style={styles.removePhotoText}>❌ Delete Photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TouchableOpacity 
              style={styles.photoButton} 
              onPress={handleTakePhoto}
              disabled={isLoading}
            >
              <Text style={styles.photoButtonText}>📷 Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.photoButton} 
              onPress={handlePickImage}
              disabled={isLoading}
            >
              <Text style={styles.photoButtonText}>🖼️ Choose From Gallery</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Product Title*"
        value={title}
        onChangeText={setTitle}
        placeholderTextColor="#94a3b8"
        editable={!isLoading}
      />

      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        placeholderTextColor="#94a3b8"
        editable={!isLoading}
      />

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={type}
          onValueChange={(itemValue: ProductType) => setType(itemValue)}
          mode="dropdown"
        >
          <Picker.Item label="Starter" value="starter" />
          <Picker.Item label="Fast Food" value="fastfood" />
          <Picker.Item label="Drink" value="drink" />
          <Picker.Item label="Dessert" value="dessert" />
        </Picker>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Price*"
        keyboardType="numeric"
        value={price}
        onChangeText={setPrice}
        placeholderTextColor="#94a3b8"
        editable={!isLoading}
      />

      <TouchableOpacity 
        style={[styles.saveButton, isLoading && styles.disabledButton]} 
        onPress={handleSaveProduct}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.saveButtonText}>💾 Save Product </Text>
        )}
      </TouchableOpacity>

      <Text style={styles.sectionTitle}> Saved Products </Text>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id!}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.productTitle}>{item.title}</Text>
              <Text style={styles.productText}>{item.description}</Text>
              <Text style={styles.productText}>Type: {item.type}</Text>
              <Text style={styles.productText}>Price: ${item.price}</Text>
              {item.photo && (
                <Image 
                  source={{ uri: item.photo }} 
                  style={styles.productImage} 
                />
              )}
            </View>
            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={[styles.deleteButton, isLoading && styles.disabledButton]}
                onPress={() => handleDeleteProduct(item.id!)}
                disabled={isLoading}
              >
                <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 30 }}
      />

        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
          disabled={isLoading}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF5EC',
  },
  container: {
    flexGrow: 1,
    backgroundColor: '#FFF5EC',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  pickerContainer: {
    backgroundColor: "#FFFAF0",
    borderRadius: 10,
    padding: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E9967A",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#8B0000",
    marginBottom: 32,
    textAlign: "center",
  },
  photoSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  photoButton: {
    backgroundColor: "#FFCC99",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FF9966",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  photoButtonText: {
    color: "#8B0000",
    fontWeight: "600",
    fontSize: 14,
  },
  input: {
    backgroundColor: "#FFFAF0",
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    color: "#5D2E0C",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E9967A", 
  },
  saveButton: {
    backgroundColor: "#FF6347",
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
    alignItems: "center",
    shadowColor: "#8B0000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: "#CD853F",
  },
  saveButtonText: {
    color: "#FFFAF0",
    fontWeight: "bold",
    fontSize: 16,
    textTransform: "uppercase",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#8B0000",
    marginBottom: 24,
  },
  productCard: {
    backgroundColor: "#FFFAF0",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#E9967A",
    borderWidth: 1,
    shadowColor: "#A0522D",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#5D2E0C",
    marginBottom: 4,
  },
  productText: {
    color: "#A0522D",
    fontSize: 14,
    marginBottom: 2,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginTop: 8,
  },
  editButton: {
    backgroundColor: "#FFE4B5",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FFDAB9",
    marginLeft: 12,
  },
  editButtonText: {
    color: "#8B0000",
    fontWeight: "600",
    fontSize: 13,
  },
  logoutContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  imagePreview: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  removePhotoButton: {
    backgroundColor: '#FFC0CB',
    padding: 8,
    borderRadius: 6,
  },
  removePhotoText: {
    color: '#8B0000',
    fontWeight: '600',
  },
  buttonsContainer: {
    flexDirection: 'column',
    marginLeft: 12,
  },
  deleteButton: {
    backgroundColor: "#FFA07A",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FF7F50",
  },
  deleteButtonText: {
    color: "#8B0000",
    fontWeight: "600",
    fontSize: 13,
  },
  logoutButton: {
    backgroundColor: '#B22222',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
    shadowColor: '#FF6347',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  logoutButtonText: {
    color: '#FFFAF0',
    fontWeight: 'bold',
    fontSize: 16,
  },
});