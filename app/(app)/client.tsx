import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList, Image, SafeAreaView, ActivityIndicator, Alert, Modal } from 'react-native';
import { Product, ProductType } from '@/interfaces/common';
import { useAuth } from '@/context/AuthContext';
import { useProducts } from '@/context/ProductContext';
import { useOrders } from '@/context/OrderContext';

export default function CustomerScreen() {
  const { user, logout } = useAuth();
  const { products, loading: productsLoading, error: productsError } = useProducts();
  const { 
    cart: orderCart, 
    addToCart: addToOrderCart,
    removeFromCart,
    createOrder, 
    clearCart, 
    getCartTotal,
    updateQuantity, 
    orders,
    loading: ordersLoading, 
    error: ordersError 
  } = useOrders();
  
  const [selectedCategory, setSelectedCategory] = useState<ProductType | 'All'>('All');
  const [showOrders, setShowOrders] = useState(false);

  const categories: (ProductType | 'All')[] = ['All', 'starter', 'fastfood', 'drink', 'dessert'];
  const categoryLabels = {
    'All': 'All',
    'starter': 'Starter',
    'fastfood': 'Fast Food',
    'drink': 'Drinks',
    'dessert': 'Desserts'
  };

  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(product => product.type === selectedCategory);

  const userOrders = orders.filter(order => order.userId === user?.uid);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
        Alert.alert('Empty Cart', 'Please add products to the cart before placing an order');
        return;
      }

      const orderId = await createOrder();
      
      Alert.alert(
        'Order Created!', 
        `Your order #${orderId.substring(0, 6)} has been successfully received`,
        [
          { 
            text: 'OK',
            onPress: () => clearCart()
          }
        ]
      );
      
    } catch (error) {
      console.error('Error creating order:', error);
      Alert.alert(
        'Error', 
        'The order could not be created. Please try again'
      );
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>🍔 Digital Menu</Text>

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
                <Text style={styles.emptyText}>No products available in this category</Text>
              </View>
            }
          />
        )}

        {orderCart.length > 0 && (
          <View style={styles.cartContainer}>
            <View style={styles.cartHeader}>
              <Text style={styles.cartTitle}>🛒 Your Order</Text>
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
                <Text style={styles.orderButtonText}>Make Order</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomButtonsContainer}>
          <TouchableOpacity 
            style={[styles.bottomButton, styles.ordersButton]} 
            onPress={() => setShowOrders(true)}
          >
            <Text style={styles.bottomButtonText}>My Orders</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.bottomButton, styles.logoutButton]} 
            onPress={handleLogout}
          >
            <Text style={styles.bottomButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <Modal
          visible={showOrders}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setShowOrders(false)}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>My Orders</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowOrders(false)}
              >
                <Text style={styles.closeButtonText}>X</Text>
              </TouchableOpacity>
            </View>

            {ordersLoading ? (
              <ActivityIndicator size="large" color="#3b82f6" />
            ) : ordersError ? (
              <Text style={styles.errorText}>{ordersError}</Text>
            ) : userOrders.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>You don't have any orders yet</Text>
              </View>
            ) : (
              <FlatList
                data={userOrders.sort((a, b) => 
                  (b.createdAt instanceof Date ? b.createdAt.getTime() : 0) - 
                  (a.createdAt instanceof Date ? a.createdAt.getTime() : 0)
                )}
                keyExtractor={item => item.id ?? 'unknown-id'}
                renderItem={({ item }) => (
                  <View style={styles.orderCard}>
                    <View style={styles.orderHeader}>
                      <Text style={styles.orderId}>Order #{(item.id ?? '').substring(0, 6)}</Text>
                      <Text style={[
                        styles.orderStatus,
                        item.status === 'Preparing' && styles.statusPreparing,
                        item.status === 'Ordered' && styles.statusOrdered,
                        item.status === 'Delivered' && styles.statusCompleted,
                        item.status === 'Cancelled' && styles.statusCancelled,
                      ]}>
                        {item.status === 'Ordered' ? 'Pending' : 
                        item.status === 'Preparing' ? 'Preparing' : 
                        item.status === 'Delivered' ? 'Completed' : 'Completed'}
                      </Text>
                    </View>
                    
                    <Text style={styles.orderDate}>{item.createdAt ? formatDate(item.createdAt as Date) : 'Date not Available'}</Text>
                    <Text style={styles.orderTotal}>Total: ${item.total.toLocaleString()}</Text>
                    
                    <View style={styles.orderItemsContainer}>
                      {item.items.map((orderItem, index) => (
                        <View key={index} style={styles.orderItem}>
                          <Text style={styles.orderItemName}>
                            {orderItem.quantity}x {orderItem.title}
                          </Text>
                          <Text style={styles.orderItemPrice}>
                            ${(orderItem.price * orderItem.quantity).toLocaleString()}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
                contentContainerStyle={styles.ordersListContainer}
              />
            )}
          </SafeAreaView>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF5EC',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF5EC',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#5D2E0C',
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
    backgroundColor: '#FFCC99',
    marginRight: 12,
    shadowColor: '#A0522D',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedCategory: {
    backgroundColor: '#E9967A',
  },
  categoryText: {
    color: '#A0522D',
    fontWeight: '600',
    fontSize: 14,
  },
  selectedCategoryText: {
    color: '#FFFAF0',
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
    color: '#B22222',
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
    color: '#CD853F',
    textAlign: 'center',
  },
  productCard: {
    backgroundColor: '#FFFAF0',
    borderRadius: 16,
    marginBottom: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#A0522D',
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
    color: '#5D2E0C',
    marginBottom: 6,
  },
  productDescription: {
    color: '#CD853F',
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  productPrice: {
    color: '#5D2E0C',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 16,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFCC99',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  quantityButton: {
    padding: 8,
    backgroundColor: '#FFE4B5',
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
    color: '#5D2E0C',
    lineHeight: 18,
  },
  quantityNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5D2E0C',
    minWidth: 20,
    textAlign: 'center',
  },
  cartContainer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    backgroundColor: '#FFFAF0',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 15,
    borderWidth: 1,
    borderColor: '#FFCC99',
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#FFCC99',
  },
  cartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5D2E0C',
  },
  cartTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E9967A',
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
    borderBottomColor: '#FFCC99',
  },
  cartItemLeft: {
    flex: 1,
    marginRight: 10,
  },
  cartItemName: {
    color: '#5D2E0C',
    fontWeight: '600',
    fontSize: 15,
  },
  cartItemQuantity: {
    color: '#CD853F',
    fontWeight: 'normal',
  },
  cartItemPrice: {
    fontWeight: '700',
    color: '#5D2E0C',
    fontSize: 15,
  },
  orderButton: {
    backgroundColor: '#E9967A',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#FF6347',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  orderButtonText: {
    color: '#FFFAF0',
    fontWeight: 'bold',
    fontSize: 16,
  },
  bottomButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  bottomButton: {
    padding: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginHorizontal: 5,
    flex: 1,
  },
  bottomButtonText: {
    color: '#FFFAF0',
    fontWeight: 'bold',
    fontSize: 14,
  },
  ordersButton: {
    backgroundColor: '#CD853F',
    shadowColor: '#A0522D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  logoutButton: {
    backgroundColor: '#B22222',
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFF5EC',
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5D2E0C',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#FFCC99',
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontWeight: 'bold',
    color: '#A0522D',
  },
  ordersListContainer: {
    paddingBottom: 20,
  },
  orderCard: {
    backgroundColor: '#FFFAF0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#A0522D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5D2E0C',
  },
  orderStatus: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusOrdered: {
    backgroundColor: '#FFE4B5',
    color: '#CD853F',
  },
  statusPreparing: {
    backgroundColor: '#FFCC99',
    color: '#A0522D',
  },
  statusCompleted: {
    backgroundColor: '#FFFAF0',
    color: '#5D2E0C',
  },
  statusCancelled: {
    backgroundColor: '#FFC0CB',
    color: '#8B0000',
  },
  orderDate: {
    color: '#CD853F',
    fontSize: 14,
    marginBottom: 8,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5D2E0C',
    marginBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#FFCC99',
    paddingTop: 12,
  },
  orderItemsContainer: {
    marginTop: 8,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  orderItemName: {
    color: '#A0522D',
    fontSize: 14,
  },
  orderItemPrice: {
    color: '#5D2E0C',
    fontSize: 14,
    fontWeight: '600',
  },
});