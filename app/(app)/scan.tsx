import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, Text, Alert, StyleSheet } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";

const QRScanner = () => {
const [permission, requestPermission] = useCameraPermissions();
const [isProcessing, setIsProcessing] = useState(false);
const lastScannedData = useRef<string | null>(null);
const scanTimeout = useRef<NodeJS.Timeout | null>(null);

useEffect(() => {
return () => {
    if (scanTimeout.current) clearTimeout(scanTimeout.current);
};
}, []);

const handleBarCodeScanned = useCallback(({ data }: { data: string }) => {
if (isProcessing || data === lastScannedData.current) return;

setIsProcessing(true);
lastScannedData.current = data;

const tableNumber = data.replace(/\D/g, "");

if (!tableNumber) {
    Alert.alert("QR inválido", "Debe contener un número de mesa", [
    { text: "OK", onPress: () => setIsProcessing(false) }
    ]);
    return;
}

Alert.alert(
    "Mesa asignada",
    `Estás en la mesa ${tableNumber}`,
    [
    {
        text: "OK",
        onPress: () => {
        router.navigate({
            pathname: "/(app)/client",
            params: { tableNumber },
        });
        },
    },
    ],
    {
    cancelable: false,
    onDismiss: () => {
        scanTimeout.current = setTimeout(() => {
        setIsProcessing(false);
        lastScannedData.current = null;
        }, 2000);
    }
    }
);
}, [isProcessing]);

if (!permission) return <Text>Cargando...</Text>;
if (!permission.granted) return <Text>Se necesita permiso de cámara</Text>;

return (
<View style={styles.container}>
    <CameraView
    facing="back"
    barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
    onBarcodeScanned={isProcessing ? undefined : handleBarCodeScanned}
    style={StyleSheet.absoluteFillObject}
    >
    <View style={styles.overlay}>
        <Text style={styles.instruction}>Escanea el QR de tu mesa</Text>
        <View style={styles.qrFrame} />
        {isProcessing && (
        <View style={styles.processingOverlay}>
            <Text style={styles.processingText}>Procesando...</Text>
        </View>
        )}
    </View>
    </CameraView>
</View>
);
};

const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: "black",
},
overlay: {
flex: 1,
justifyContent: "center",
alignItems: "center",
},
instruction: {
color: "white",
fontSize: 18,
marginBottom: 20,
backgroundColor: "rgba(0,0,0,0.7)",
padding: 15,
borderRadius: 10,
},
qrFrame: {
width: 250,
height: 250,
borderWidth: 2,
borderColor: "white",
backgroundColor: "transparent",
},
processingOverlay: {
...StyleSheet.absoluteFillObject,
backgroundColor: "rgba(0,0,0,0.7)",
justifyContent: "center",
alignItems: "center",
},
processingText: {
color: "white",
fontSize: 20,
fontWeight: "bold",
},
});

export default QRScanner;