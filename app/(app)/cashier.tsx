import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import {
  View,
  Text,
  TextInput,
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
  const { logout } = useAuth();

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
        placeholderTextColor="#94a3b8"
      />

      <TextInput
        style={styles.input}
        placeholder="Descripción"
        value={description}
        onChangeText={setDescription}
        multiline
        placeholderTextColor="#94a3b8"
      />

      <TextInput
        style={styles.input}
        placeholder="Tipo de producto"
        value={type}
        onChangeText={setType}
        placeholderTextColor="#94a3b8"
      />

      <TextInput
        style={styles.input}
        placeholder="Precio"
        keyboardType="numeric"
        value={price}
        onChangeText={setPrice}
        placeholderTextColor="#94a3b8"
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
      <View style={styles.logoutContainer}>
        <TouchableOpacity onPress={async () => {
          await logout();
          router.replace("/auth");
        }} style={styles.logoutButton}>
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
});