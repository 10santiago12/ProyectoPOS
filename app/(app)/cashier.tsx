import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
} from "react-native";

export default function CashierScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [price, setPrice] = useState("");

  const mockProducts = [
    {
      id: "1",
      title: "Hamburguesa",
      description: "Doble carne con queso",
      type: "Comida rápida",
      price: "25000",
    },
    {
      id: "2",
      title: "Jugo natural",
      description: "Jugo de naranja sin azúcar",
      type: "Bebida",
      price: "8000",
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>🧾 Agregar Producto</Text>

      <View style={styles.photoSection}>
        <TouchableOpacity style={styles.photoButton} onPress={() => {}}>
          <Text style={styles.photoButtonText}>📷 Tomar Foto</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.photoButton} onPress={() => {}}>
          <Text style={styles.photoButtonText}>🖼️ Adjuntar Foto</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Título del producto"
        value={title}
        onChangeText={setTitle}
        placeholderTextColor="#888"
      />

      <TextInput
        style={styles.input}
        placeholder="Descripción"
        value={description}
        onChangeText={setDescription}
        multiline
        placeholderTextColor="#888"
      />

      <TextInput
        style={styles.input}
        placeholder="Tipo de producto"
        value={type}
        onChangeText={setType}
        placeholderTextColor="#888"
      />

      <TextInput
        style={styles.input}
        placeholder="Precio"
        keyboardType="numeric"
        value={price}
        onChangeText={setPrice}
        placeholderTextColor="#888"
      />

      <TouchableOpacity style={styles.saveButton} onPress={() => {}}>
        <Text style={styles.saveButtonText}>💾 Guardar Producto</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>🧺 Productos Agregados</Text>

      <FlatList
        data={mockProducts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.productTitle}>{item.title}</Text>
              <Text style={styles.productText}>{item.description}</Text>
              <Text style={styles.productText}>Tipo: {item.type}</Text>
              <Text style={styles.productText}>Precio: ${item.price}</Text>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => {
                // Aquí se implementará la funcionalidad de editar más adelante
              }}
            >
              <Text style={styles.editButtonText}>✏️ Editar</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 30 }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 32,
    backgroundColor: "#f0f4f8",
    flexGrow: 1,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a202c",
    marginBottom: 32,
    textAlign: "center",
  },
  photoSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  photoButton: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginHorizontal: 6,
  },
  photoButtonText: {
    color: "#3182ce",
    fontWeight: "600",
    fontSize: 14,
  },
  input: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    color: "#1a202c",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  saveButton: {
    backgroundColor: "#3182ce",
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    color: "#1a202c",
    marginBottom: 24,
  },
  productCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a202c",
    marginBottom: 4,
  },
  productText: {
    color: "#4a5568",
    fontSize: 14,
    marginBottom: 2,
  },
  editButton: {
    backgroundColor: "#edf2f7",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  editButtonText: {
    color: "#3182ce",
    fontWeight: "600",
    fontSize: 13,
  },
});
