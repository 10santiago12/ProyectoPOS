import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useProducts } from "@/context/ProductContext";
import { router } from "expo-router";
import {View,
  Text,TextInput,TouchableOpacity,StyleSheet,ScrollView,FlatList,Image,Alert,ActivityIndicator,
  Platform} from "react-native";

export default function CashierScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [price, setPrice] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { logout } = useAuth();
  const { products, addProduct, pickImage, takePhoto } = useProducts();

  const handleSaveProduct = async () => {
    if (!title || !price) {
      Alert.alert("Error", "Por favor complete al menos el título y el precio");
      return;
    }

    setIsLoading(true);
    try {
      await addProduct(
        { title, description, type, price },
        photoUri || null
      );
      
      // Limpiar formulario
      setTitle("");
      setDescription("");
      setType("");
      setPrice("");
      setPhotoUri(null);
      
      Alert.alert("Éxito", "Producto guardado correctamente");
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar el producto");
      console.error(error);
    } finally {
      setIsLoading(false);
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
    // Comportamiento normal para móvil
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
      Alert.alert("Error", "No se pudo acceder a la galería");
      console.error(error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>🧾 Agregar Producto</Text>

      <View style={styles.photoSection}>
        {photoUri ? (
          <View style={styles.imagePreview}>
            <Image source={{ uri: photoUri }} style={styles.image} />
            <TouchableOpacity 
              style={styles.removePhotoButton} 
              onPress={() => setPhotoUri(null)}
            >
              <Text style={styles.removePhotoText}>❌ Eliminar foto</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TouchableOpacity 
              style={styles.photoButton} 
              onPress={handleTakePhoto}
              disabled={isLoading}
            >
              <Text style={styles.photoButtonText}>📷 Tomar Foto</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.photoButton} 
              onPress={handlePickImage}
              disabled={isLoading}
            >
              <Text style={styles.photoButtonText}>🖼️ Elegir de Galería</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Título del producto*"
        value={title}
        onChangeText={setTitle}
        placeholderTextColor="#94a3b8"
        editable={!isLoading}
      />

      <TextInput
        style={styles.input}
        placeholder="Descripción"
        value={description}
        onChangeText={setDescription}
        multiline
        placeholderTextColor="#94a3b8"
        editable={!isLoading}
      />

      <TextInput
        style={styles.input}
        placeholder="Tipo de producto"
        value={type}
        onChangeText={setType}
        placeholderTextColor="#94a3b8"
        editable={!isLoading}
      />

      <TextInput
        style={styles.input}
        placeholder="Precio*"
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
          <Text style={styles.saveButtonText}>💾 Guardar Producto</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>🧺 Productos Agregados</Text>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id!}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.productTitle}>{item.title}</Text>
              <Text style={styles.productText}>{item.description}</Text>
              <Text style={styles.productText}>Tipo: {item.type}</Text>
              <Text style={styles.productText}>Precio: ${item.price}</Text>
              {item.photo && (
                <Image 
                  source={{ uri: item.photo }} 
                  style={styles.productImage} 
                />
              )}
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => {
                // TODO: Implementar edición
              }}
              disabled={isLoading}
            >
              <Text style={styles.editButtonText}>✏️ Editar</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 30 }}
      />

      <View style={styles.logoutContainer}>
        <TouchableOpacity 
          onPress={async () => {
            await logout();
            router.replace("/auth");
          }} 
          style={styles.logoutButton}
          disabled={isLoading}
        >
          <Text style={styles.logoutText}>🔓 Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 28,
    backgroundColor: "#f8fafc",
    flexGrow: 1,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1e3a8a",
    marginBottom: 32,
    textAlign: "center",
  },
  photoSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  photoButton: {
    backgroundColor: "#e0f2fe",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#bae6fd",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  photoButtonText: {
    color: "#0369a1",
    fontWeight: "600",
    fontSize: 14,
  },
  input: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    color: "#0f172a",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  saveButton: {
    backgroundColor: "#3b82f6",
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  disabledButton: {
    backgroundColor: "#9ca3af",
  },
  saveButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
    textTransform: "uppercase",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1e3a8a",
    marginBottom: 24,
  },
  productCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#e2e8f0",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4,
  },
  productText: {
    color: "#64748b",
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
    backgroundColor: "#f1f5f9",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    marginLeft: 12,
  },
  editButtonText: {
    color: "#1d4ed8",
    fontWeight: "600",
    fontSize: 13,
  },
  logoutContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  logoutButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#e2e8f0",
    borderRadius: 8,
  },
  logoutText: {
    color: "#334155",
    fontWeight: "600",
    fontSize: 14,
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
    backgroundColor: '#fee2e2',
    padding: 8,
    borderRadius: 6,
  },
  removePhotoText: {
    color: '#b91c1c',
    fontWeight: '600',
  },
});