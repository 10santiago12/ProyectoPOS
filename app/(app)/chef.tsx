import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { useOrders } from "@/context/OrderContext"; // Importar el contexto para obtener las órdenes desde Firebase

export default function ChefScreen() {
  const { orders, loading, error, updateOrderStatus } = useOrders(); // Obtener las órdenes y la función para actualizar el estado
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");

  // Filtrar las órdenes para mostrar las que tienen el estado 'Ordered' o 'Preparing'
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

  // Función para cambiar el estado de una orden
  const changeStatus = async (orderId: string, currentStatus: string) => {
    let newStatus = "";
    // Definir el nuevo estado según el estado actual
    if (currentStatus === "Ordered") {
      newStatus = "Preparing";
    } else if (currentStatus === "Preparing") {
      newStatus = "Ready";
    } else if (currentStatus === "Ready") {
      newStatus = "Completed"; // O cualquier otro estado final que desees
    }

    try {
      await updateOrderStatus(orderId, newStatus); // Llamar a la función del contexto para actualizar el estado en Firebase
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

      {/* Filtros por categoría (si fuera necesario) */}
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => (item.id || item.createdAt?.toString()) ?? "no-id"} // Asegurarse de que 'id' esté siempre definido
        renderItem={({ item }) => (
          <View style={styles.orderCard}>
            <Text style={styles.orderTimestamp}>Order Time: {item.createdAt?.toLocaleString()}</Text>
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

      {/* Mensajes de error o carga */}
      {loading && <Text>Loading orders...</Text>}
      {error && <Text style={styles.errorText}>{error}</Text>}
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
  errorText: {
    color: "red",
    fontWeight: "bold",
  },
});