import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { useOrders } from "@/context/OrderContext";
import { FieldValue } from "firebase/firestore";

export default function ChefScreen() {
  const { orders, loading, error, updateOrderStatus } = useOrders();
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getTimePassed = (orderTime: Date | FieldValue | undefined): string => {
    if (!orderTime) return "N/A";

    let orderDate: Date;
    if (orderTime instanceof Date) {
      orderDate = orderTime;
    } else if (orderTime && "toDate" in orderTime && typeof (orderTime as any).toDate === "function") {
      orderDate = (orderTime as any).toDate();
    } else {
      return "N/A";
    }

    const diffInMs = currentTime.getTime() - orderDate.getTime();
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const remainingSeconds = diffInSeconds % 60;

    if (diffInMinutes > 0) {
      return `${diffInMinutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const filteredOrders = orders.filter(
    (order) => order.status === "Ordered" || order.status === "Preparing"
  );

  if (filteredOrders.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Chef's Orders</Text>
        <Text style={styles.errorText}>No hay órdenes entrantes</Text>
      </View>
    );
  }

  const changeStatus = async (orderId: string, currentStatus: string) => {
    let newStatus = "";
    if (currentStatus === "Ordered") {
      newStatus = "Preparing";
    } else if (currentStatus === "Preparing") {
      newStatus = "Ready";
    } else if (currentStatus === "Ready") {
      newStatus = "Completed";
    }

    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(`Error al cambiar el estado de la orden ${orderId}: ${err.message}`);
      } else {
        console.error(`Error al cambiar el estado de la orden ${orderId}: ${err}`);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Chef's Orders</Text>
      <Text style={styles.currentTime}>
        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </Text>

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => (item.id || item.createdAt?.toString()) ?? "no-id"}
        renderItem={({ item }) => (
          <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderTimestamp}>
                {item.createdAt?.toLocaleString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </Text>
              <Text style={styles.timePassed}>
                {getTimePassed(item.createdAt)} ago
              </Text>
            </View>
            <Text style={styles.orderStatus}>Status: {item.status}</Text>
            <Text style={styles.orderTitle}>Items:</Text>
            {item.items.map((orderItem) => (
              <Text key={orderItem.productId} style={styles.orderItem}>
                {orderItem.quantity}x {orderItem.title}
              </Text>
            ))}
            <View style={styles.statusButtons}>
              {item.status === "Ordered" && (
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => changeStatus(item.id!, "Ordered")}
                >
                  <Text style={styles.buttonText}>Start Cooking</Text>
                </TouchableOpacity>
              )}
              {item.status === "Preparing" && (
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => changeStatus(item.id!, "Preparing")}
                >
                  <Text style={styles.buttonText}>Mark as Ready</Text>
                </TouchableOpacity>
              )}
              {item.status === "Ready" && (
                <Text style={styles.doneText}>Ready for Pickup</Text>
              )}
            </View>
          </View>
        )}
        contentContainerStyle={styles.ordersList}
      />

      {loading && <Text>Loading orders...</Text>}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF5EC", // Warm cream
    padding: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#5D2E0C", // Dark brown
    marginBottom: 20,
    textAlign: "center",
  },
  currentTime: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#A0522D", // Sienna
    textAlign: "center",
    marginBottom: 10,
  },
  ordersList: {
    paddingBottom: 80,
  },
  orderCard: {
    backgroundColor: "#FFFAF0", // White cream
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#8B0000", // Deep red shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  orderTimestamp: {
    fontSize: 14,
    color: "#A0522D", // Sienna
  },
  timePassed: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FF6347", // Tomato red
  },
  orderStatus: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#CD853F", // Peru (brownish)
    marginBottom: 8,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#5D2E0C", // Dark brown
  },
  orderItem: {
    fontSize: 16,
    color: "#A0522D", // Sienna
    marginBottom: 4,
  },
  statusButtons: {
    marginTop: 10,
  },
  button: {
    backgroundColor: "#FF7F50", // Coral
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFAF0", // White cream
    fontWeight: "bold",
  },
  doneText: {
    color: "#CD853F", // Peru (brownish)
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "#B22222", // Firebrick red
    fontWeight: "bold",
  },
});