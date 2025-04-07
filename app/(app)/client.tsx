import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList, Image } from 'react-native';

interface Product {
  id: string;
  title: string;
  description: string;
  price: string;
  photo?: string;
}

interface CartItem extends Product {
  quantity: number;
}

export default function CustomerScreen() {
  // Datos de ejemplo (luego los reemplazarás con los productos reales)
  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      title: 'Hamburguesa Clásica',
      description: 'Carne, queso, lechuga y tomate',
      price: '25000',
      photo: 'https://example.com/burger.jpg'
    },
    {
      id: '2',
      title: 'Jugo Natural',
      description: 'Jugo de naranja recién exprimido',
      price: '8000',
      photo: 'https://example.com/juice.jpg'
    }
  ]);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  // Categorías de ejemplo
  const categories = ['Todos', 'Comida rápida', 'Bebidas', 'Postres'];

  return (
    <View style={styles.container}>
      {/* Encabezado */}
      <Text style={styles.header}>🍔 Menú Digital</Text>
      
      {/* Filtros por categoría */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.selectedCategory
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={styles.categoryText}>{category}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Lista de productos */}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            {item.photo && (
              <Image source={{ uri: item.photo }} style={styles.productImage} />
            )}
            <View style={styles.productInfo}>
              <Text style={styles.productTitle}>{item.title}</Text>
              <Text style={styles.productDescription}>{item.description}</Text>
              <Text style={styles.productPrice}>${item.price}</Text>
              
              <View style={styles.quantityControls}>
                <TouchableOpacity 
                  style={styles.quantityButton}
                  onPress={() => {}}
                >
                  <Text style={styles.quantityText}>-</Text>
                </TouchableOpacity>
                
                <Text style={styles.quantityText}>0</Text>
                
                <TouchableOpacity 
                  style={styles.quantityButton}
                  onPress={() => {}}
                >
                  <Text style={styles.quantityText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        contentContainerStyle={styles.productsContainer}
      />

      {/* Carrito flotante */}
      {cart.length > 0 && (
        <View style={styles.cartContainer}>
          <View style={styles.cartHeader}>
            <Text style={styles.cartTitle}>🛒 Tu Pedido</Text>
            <Text style={styles.cartTotal}>Total: $0</Text>
          </View>
          
          <ScrollView style={styles.cartItemsContainer}>
            {cart.map(item => (
              <View key={item.id} style={styles.cartItem}>
                <Text style={styles.cartItemName}>{item.title} x{item.quantity}</Text>
                <Text style={styles.cartItemPrice}>${item.price}</Text>
              </View>
            ))}
          </ScrollView>
          
          <TouchableOpacity style={styles.orderButton}>
            <Text style={styles.orderButtonText}>Realizar Pedido</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginVertical: 20,
    textAlign: 'center',
  },
  categoriesContainer: {
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
    marginRight: 10,
  },
  selectedCategory: {
    backgroundColor: '#3b82f6',
  },
  categoryText: {
    color: '#1e293b',
    fontWeight: '600',
  },
  productsContainer: {
    paddingBottom: 150, // Espacio para el carrito
  },
  productCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: 120,
    height: 120,
  },
  productInfo: {
    flex: 1,
    padding: 16,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  productDescription: {
    color: '#64748b',
    fontSize: 14,
    marginBottom: 8,
  },
  productPrice: {
    color: '#1e3a8a',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 12,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  quantityButton: {
    padding: 8,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  cartContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  cartTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  cartItemsContainer: {
    maxHeight: 150,
    marginBottom: 16,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  cartItemName: {
    color: '#475569',
  },
  cartItemPrice: {
    fontWeight: '600',
    color: '#1e293b',
  },
  orderButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  orderButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});