import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";

interface OrderItem {
  id: string;
  title: string;
  quantity: number;
}

interface Order {
  id: string;
  items: OrderItem[];
  status: string;
  timestamp: string;
}

export default function ChefScreen() {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "1",
      items: [
        { id: "1", title: "Hamburguesa Clásica", quantity: 2 },
        { id: "2", title: "Papas fritas", quantity: 1 },
      ],
      status: "New",
      timestamp: new Date().toLocaleString(),
    },
    {
      id: "2",
      items: [
        { id: "3", title: "Jugo Natural", quantity: 3 },
        { id: "4", title: "Tostadas", quantity: 2 },
      ],
      status: "New",
      timestamp: new Date().toLocaleString(),
    },
  ]);

  const changeStatus = (orderId: string, newStatus: string) => {
    const updatedOrders = orders.map((order) => {
      if (order.id === orderId) {
        return { ...order, status: newStatus, timestamp: new Date().toLocaleString() };
      }
      return order;
    });
    setOrders(updatedOrders);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Chef's Orders</Text>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.orderCard}>
            <Text style={styles.orderTimestamp}>Order Time: {item.timestamp}</Text>
            <Text style={styles.orderStatus}>Status: {item.status}</Text>
            <Text style={styles.orderTitle}>Items:</Text>
            {item.items.map((orderItem) => (
              <Text key={orderItem.id} style={styles.orderItem}>
                {orderItem.quantity}x {orderItem.title}
              </Text>
            ))}
            <View style={styles.statusButtons}>
              {item.status === "New" && (
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => changeStatus(item.id, "Cooking")}
                >
                  <Text style={styles.buttonText}>Start Cooking</Text>
                </TouchableOpacity>
              )}
              {item.status === "Cooking" && (
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => changeStatus(item.id, "Done")}
                >
                  <Text style={styles.buttonText}>Mark as Done</Text>
                </TouchableOpacity>
              )}
              {item.status === "Done" && (
                <Text style={styles.doneText}>Ready for Pickup</Text>
              )}
            </View>
          </View>
        )}
        contentContainerStyle={styles.ordersList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1e3a8a",
    marginBottom: 20,
    textAlign: "center",
  },
  ordersList: {
    paddingBottom: 80,
  },
  orderCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderTimestamp: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 8,
  },
  orderStatus: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3b82f6",
    marginBottom: 8,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#0f172a",
  },
  orderItem: {
    fontSize: 16,
    color: "#475569",
    marginBottom: 4,
  },
  statusButtons: {
    marginTop: 10,
  },
  button: {
    backgroundColor: "#3b82f6",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  doneText: {
    color: "#10b981",
    fontSize: 16,
    fontWeight: "bold",
  },
});