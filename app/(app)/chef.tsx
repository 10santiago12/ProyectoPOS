import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { useOrders } from "@/context/OrderContext";
import { Order } from "@/interfaces/common";

export default function ChefScreen() {
  const { orders, loading, error } = useOrders();
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  useEffect(() => {
    const debugMessages: string[] = [];
    
    debugMessages.push(`--- INICIO DEBUGGING (${new Date().toLocaleTimeString()}) ---`);
    debugMessages.push(`Estado de carga: ${loading}`);
    debugMessages.push(`Error: ${error || "Ninguno"}`);
    debugMessages.push(`Total de órdenes recibidas: ${orders.length}`);

    // Mostrar información de las primeras 3 órdenes para no saturar la consola
    orders.slice(0, 3).forEach((order, index) => {
      debugMessages.push(`Orden ${index + 1}:`);
      debugMessages.push(`- ID: ${order.id}`);
      debugMessages.push(`- Estado: ${order.status}`);
      debugMessages.push(`- Items: ${order.items.length}`);
      debugMessages.push(`- Creada: ${order.createdAt?.toString() || 'Fecha no disponible'}`);
    });

    // Filtramos órdenes relevantes para el chef
    const chefOrders = orders.filter(order => 
      ["Ordered", "Preparing", "Ready"].includes(order.status)
    );
    
    debugMessages.push(`Órdenes filtradas: ${chefOrders.length}`);
    setFilteredOrders(chefOrders);
    
    debugMessages.push(`--- FIN DEBUGGING ---`);
    setDebugInfo(debugMessages);

    // También mostramos en la consola para ver completo
    console.log("Debugging ChefScreen:", debugMessages.join('\n'));
  }, [orders, loading, error]);

  const changeStatus = (orderId: string, newStatus: Order["status"]) => {
    // Implementar lógica para actualizar en Firebase aquí
    setFilteredOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId
          ? { ...order, status: newStatus }
          : order
      )
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.debugText}>Cargando órdenes...</Text>
        <Text style={styles.debugText}>Debug Info:</Text>
        {debugInfo.map((msg, index) => (
          <Text key={index} style={styles.debugText}>{msg}</Text>
        ))}
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <Text style={styles.debugText}>Debug Info:</Text>
        {debugInfo.map((msg, index) => (
          <Text key={index} style={styles.debugText}>{msg}</Text>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Órdenes para el Chef</Text>
      
      {/* Panel de debugging visible en la app */}
      <View style={styles.debugContainer}>
        <Text style={styles.debugTitle}>Información de Debug:</Text>
        <Text style={styles.debugText}>Órdenes totales: {orders.length}</Text>
        <Text style={styles.debugText}>Órdenes filtradas: {filteredOrders.length}</Text>
        <Text style={styles.debugText}>Última actualización: {new Date().toLocaleTimeString()}</Text>
      </View>

      {filteredOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay órdenes para preparar</Text>
          <Text style={styles.debugText}>Debug Info:</Text>
          {debugInfo.map((msg, index) => (
            <Text key={index} style={styles.debugText}>{msg}</Text>
          ))}
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id || Math.random().toString()}
          renderItem={({ item }) => (
            <View style={styles.orderCard}>
              <Text style={styles.orderId}>ID: {item.id}</Text>
              <Text style={styles.orderTimestamp}>
                Hora: {item.createdAt?.toLocaleString() || "N/A"}
              </Text>
              <Text style={[
                styles.orderStatus,
                item.status === "Ready" && styles.statusReady,
                item.status === "Preparing" && styles.statusPreparing
              ]}>
                Estado: {item.status}
              </Text>
              <Text style={styles.orderTitle}>Items:</Text>
              {item.items.map((orderItem) => (
                <Text key={orderItem.productId} style={styles.orderItem}>
                  {orderItem.quantity}x {orderItem.title} (${orderItem.price})
                </Text>
              ))}
              <View style={styles.statusButtons}>
                {item.status === "Ordered" && (
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => changeStatus(item.id!, "Preparing")}
                  >
                    <Text style={styles.buttonText}>Preparar</Text>
                  </TouchableOpacity>
                )}
                {item.status === "Preparing" && (
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => changeStatus(item.id!, "Ready")}
                  >
                    <Text style={styles.buttonText}>Marcar como Listo</Text>
                  </TouchableOpacity>
                )}
                {item.status === "Ready" && (
                  <Text style={styles.doneText}>Listo para recoger</Text>
                )}
              </View>
            </View>
          )}
          contentContainerStyle={styles.ordersList}
        />
      )}
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
  debugContainer: {
    backgroundColor: "#e2e8f0",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  debugTitle: {
    fontWeight: "bold",
    marginBottom: 5,
    color: "#334155",
  },
  debugText: {
    fontSize: 12,
    color: "#475569",
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#64748b",
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
  orderId: {
    fontSize: 12,
    color: "#94a3b8",
    marginBottom: 4,
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
  statusReady: {
    color: "#10b981",
  },
  statusPreparing: {
    color: "#f59e0b",
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
    textAlign: "center",
  },
});