import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  FlatList, 
  Image,
  Dimensions,
  SafeAreaView
} from 'react-native';

interface Product {
  id: string;
  title: string;
  description: string;
  price: string;
  category: string;
  photo?: string;
}

interface CartItem extends Product {
  quantity: number;
}

const { width } = Dimensions.get('window');

export default function CustomerScreen() {
  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      title: 'Hamburguesa Clásica',
      description: 'Carne de res, queso cheddar, lechuga fresca y tomate',
      price: '25000',
      category: 'Comida rápida',
      photo: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: '2',
      title: 'Jugo Natural',
      description: 'Jugo de naranja recién exprimido, sin conservantes',
      price: '8000',
      category: 'Bebidas',
      photo: 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: '3',
      title: 'Ensalada César',
      description: 'Lechuga romana, croutones, parmesano y aderezo clásico',
      price: '18000',
      category: 'Comida rápida',
      photo: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: '4',
      title: 'Tiramisú',
      description: 'Postre italiano con capas de bizcocho, café y crema de mascarpone',
      price: '12000',
      category: 'Postres',
      photo: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80'
    }
  ]);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  const categories = ['Todos', 'Comida rápida', 'Bebidas', 'Postres'];

  const filteredProducts = selectedCategory === 'Todos' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === productId);
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(item =>
          item.id === productId 
            ? { ...item, quantity: item.quantity - 1 } 
            : item
        );
      }
      return prevCart.filter(item => item.id !== productId);
    });
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + (parseInt(item.price) * item.quantity), 0);
  };

  const getQuantity = (productId: string) => {
    const item = cart.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>🍔 Menú Digital</Text>

        {/* Contenedor con altura fija para las categorías */}
        <View style={styles.categoriesWrapper}>
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
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category && styles.selectedCategoryText
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <FlatList
          data={filteredProducts}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.productCard}>
              {item.photo && (
                <Image 
                  source={{ uri: item.photo }} 
                  style={styles.productImage} 
                  resizeMode="cover"
                />
              )}
              <View style={styles.productInfo}>
                <Text style={styles.productTitle}>{item.title}</Text>
                <Text style={styles.productDescription}>{item.description}</Text>
                <Text style={styles.productPrice}>${parseInt(item.price).toLocaleString()}</Text>

                <View style={styles.quantityControls}>
                  <TouchableOpacity 
                    style={[
                      styles.quantityButton,
                      getQuantity(item.id) === 0 && styles.disabledButton
                    ]} 
                    onPress={() => removeFromCart(item.id)}
                    disabled={getQuantity(item.id) === 0}
                  >
                    <Text style={styles.quantityText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.quantityNumber}>{getQuantity(item.id)}</Text>
                  <TouchableOpacity 
                    style={styles.quantityButton} 
                    onPress={() => addToCart(item)}
                  >
                    <Text style={styles.quantityText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          contentContainerStyle={styles.productsContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No hay productos en esta categoría</Text>
            </View>
          }
        />

        {cart.length > 0 && (
          <View style={styles.cartContainer}>
            <View style={styles.cartHeader}>
              <Text style={styles.cartTitle}>🛒 Tu Pedido</Text>
              <Text style={styles.cartTotal}>Total: ${getTotal().toLocaleString()}</Text>
            </View>

            <ScrollView 
              style={styles.cartItemsContainer}
              showsVerticalScrollIndicator={false}
            >
              {cart.map(item => (
                <View key={item.id} style={styles.cartItem}>
                  <View style={styles.cartItemLeft}>
                    <Text style={styles.cartItemName}>
                      {item.title} <Text style={styles.cartItemQuantity}>x{item.quantity}</Text>
                    </Text>
                    <Text style={styles.cartItemDescription}>{item.description}</Text>
                  </View>
                  <Text style={styles.cartItemPrice}>${(parseInt(item.price) * item.quantity).toLocaleString()}</Text>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.orderButton} onPress={() => alert('Pedido realizado!')}>
              <Text style={styles.orderButtonText}>Realizar Pedido</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginVertical: 16,
    textAlign: 'center',
  },
  // Nuevos estilos para el contenedor de categorías
  categoriesWrapper: {
    height: 60, // Altura fija
    justifyContent: 'center',
  },
  categoriesContainer: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center', // Centra verticalmente los botones
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: '#e2e8f0',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedCategory: {
    backgroundColor: '#3b82f6',
  },
  categoryText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 14,
  },
  selectedCategoryText: {
    color: '#ffffff',
  },
  productsContainer: {
    paddingBottom: 180,
    paddingTop: 10, // Espacio adicional arriba
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  productCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  productImage: {
    width: 120,
    height: '100%',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  productInfo: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  productTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  productDescription: {
    color: '#64748b',
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  productPrice: {
    color: '#1e3a8a',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 16,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  quantityButton: {
    padding: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    lineHeight: 18,
  },
  quantityNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    minWidth: 20,
    textAlign: 'center',
  },
  cartContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 15,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
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
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  cartItemLeft: {
    flex: 1,
    marginRight: 10,
  },
  cartItemName: {
    color: '#1e293b',
    fontWeight: '600',
    fontSize: 15,
  },
  cartItemQuantity: {
    color: '#64748b',
    fontWeight: 'normal',
  },
  cartItemDescription: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  cartItemPrice: {
    fontWeight: '700',
    color: '#1e293b',
    fontSize: 15,
  },
  orderButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  orderButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});