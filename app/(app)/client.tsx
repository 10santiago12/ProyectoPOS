import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList, Image, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { Product, ProductType } from '@/interfaces/common';
import { useAuth } from '@/context/AuthContext';
import { useProducts } from '@/context/ProductContext';
import { useOrders } from '@/context/OrderContext';

export default function CustomerScreen() {
  const { logout } = useAuth();
  const { products, loading: productsLoading, error: productsError } = useProducts();
  const { 
    cart: orderCart, 
    addToCart: addToOrderCart,
    removeFromCart,
    createOrder, 
    clearCart, 
    getCartTotal,
    updateQuantity, 
    loading: ordersLoading, 
    error: ordersError 
  } = useOrders();
  
  const [selectedCategory, setSelectedCategory] = useState<ProductType | 'Todos'>('Todos');

  const categories: (ProductType | 'Todos')[] = ['Todos', 'starter', 'fastfood', 'drink', 'dessert'];
  const categoryLabels = {
    'Todos': 'Todos',
    'starter': 'Entradas',
    'fastfood': 'Comida rápida',
    'drink': 'Bebidas',
    'dessert': 'Postres'
  };

  const filteredProducts = selectedCategory === 'Todos' 
    ? products 
    : products.filter(product => product.type === selectedCategory);

  const handleAddToCart = (product: Product) => {
    const orderItem = {
      productId: product.id!,
      title: product.title,
      price: parseInt(product.price),
      quantity: 1
    };
    addToOrderCart(orderItem);
  };

  const handleRemoveFromCart = (productId: string) => {
    const currentQuantity = getQuantity(productId);
    if (currentQuantity > 1) {
      updateQuantity(productId, currentQuantity - 1);
    } else {
      removeFromCart(productId);
    }
  };

  const getQuantity = (productId: string) => {
    const item = orderCart.find(item => item.productId === productId);
    return item ? item.quantity : 0;
  };

  const handleSubmitOrder = async () => {
    try {
      if (orderCart.length === 0) {
        Alert.alert('Carrito vacío', 'Agrega productos al carrito antes de ordenar');
        return;
      }

      const orderId = await createOrder();
      
      Alert.alert(
        '¡Orden creada!', 
        `Tu orden ha sido recibida con éxito`,
        [
          { 
            text: 'Aceptar',
            onPress: () => clearCart()
          }
        ]
      );
      
    } catch (error) {
      console.error('Error al crear orden:', error);
      Alert.alert(
        'Error', 
        'No se pudo crear la orden. Por favor intenta nuevamente'
      );
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>🍔 Menú Digital</Text>

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
                  {categoryLabels[category]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {productsLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        ) : productsError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{productsError}</Text>
          </View>
        ) : (
          <FlatList
            data={filteredProducts}
            keyExtractor={item => item.id!}
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
                        getQuantity(item.id!) === 0 && styles.disabledButton
                      ]} 
                      onPress={() => handleRemoveFromCart(item.id!)}
                      disabled={getQuantity(item.id!) === 0}
                    >
                      <Text style={styles.quantityText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantityNumber}>{getQuantity(item.id!)}</Text>
                    <TouchableOpacity 
                      style={styles.quantityButton} 
                      onPress={() => handleAddToCart(item)}
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
        )}

        {orderCart.length > 0 && (
          <View style={styles.cartContainer}>
            <View style={styles.cartHeader}>
              <Text style={styles.cartTitle}>🛒 Tu Pedido</Text>
              <Text style={styles.cartTotal}>Total: ${getCartTotal().toLocaleString()}</Text>
            </View>

            <ScrollView 
              style={styles.cartItemsContainer}
              showsVerticalScrollIndicator={false}
            >
              {orderCart.map(item => (
                <View key={item.productId} style={styles.cartItem}>
                  <View style={styles.cartItemLeft}>
                    <Text style={styles.cartItemName}>
                      {item.title} <Text style={styles.cartItemQuantity}>x{item.quantity}</Text>
                    </Text>
                    <Text style={styles.cartItemPrice}>${item.price.toLocaleString()} c/u</Text>
                  </View>
                  <Text style={styles.cartItemPrice}>${(item.price * item.quantity).toLocaleString()}</Text>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity 
              style={styles.orderButton} 
              onPress={handleSubmitOrder}
              disabled={ordersLoading}
            >
              {ordersLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.orderButtonText}>Realizar Pedido</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
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
  categoriesWrapper: {
    height: 60,
    justifyContent: 'center',
  },
  categoriesContainer: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
  productsContainer: {
    paddingBottom: 180,
    paddingTop: 10,
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
    bottom: 60,
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
  logoutButton: {
    backgroundColor: '#ef4444',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});