import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { BlurView } from 'expo-blur';
import { getEquipmentHistory } from '../services/api';

const { width } = Dimensions.get('window');

export const QRScanScreen = () => {
  const [scanned, setScanned] = useState(false);
  const [assetTag, setAssetTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [permission, requestPermission] = useCameraPermissions();

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    setAssetTag(data);
    setLoading(true);
    setErrorMsg('');
    
    try {
      const history = await getEquipmentHistory(data);
      setInsights(history);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to fetch insights');
    } finally {
      setLoading(false);
    }
  };

  if (!permission) {
    // Camera permissions are still loading.
    return (
      <View style={styles.container}>
        <Text style={styles.subtitle}>Initializing camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <View style={styles.permissionBox}>
          <Text style={styles.permissionText}>We need your permission to show the camera</Text>
          <TouchableOpacity style={styles.grantButton} onPress={requestPermission}>
            <Text style={styles.buttonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Asset Scanner</Text>
        <Text style={styles.subtitle}>Scan equipment QR code</Text>
      </View>

      {!scanned ? (
        <View style={styles.cameraContainer}>
          <CameraView 
            style={StyleSheet.absoluteFillObject} 
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ["qr"],
            }}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          />
          
          <View style={styles.overlay}>
            <View style={styles.scanTarget}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.resultContainer}>
          <BlurView intensity={50} tint="dark" style={styles.resultBox}>
            <View style={styles.successBadge}>
              <Text style={styles.successIcon}>✓</Text>
            </View>
            <Text style={styles.successText}>Asset Identified</Text>
            <Text style={styles.assetTag}>{assetTag}</Text>
            
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Knowledge Graph Insights</Text>
              {loading ? (
                <ActivityIndicator size="small" color="#3B82F6" />
              ) : errorMsg ? (
                <Text style={styles.errorText}>{errorMsg}</Text>
              ) : insights ? (
                <>
                  <Text style={styles.cardText}>
                    • Failures: {insights.failures ? insights.failures.length : 0} recorded
                  </Text>
                  <Text style={styles.cardText}>
                    • Documents: {insights.documents ? insights.documents.length : 0} linked
                  </Text>
                  {insights.isOffline && <Text style={styles.offlineTag}>[Offline Cache]</Text>}
                </>
              ) : null}
            </View>
            
            <TouchableOpacity style={styles.resetButton} onPress={() => { setScanned(false); setInsights(null); }}>
              <Text style={styles.buttonText}>Scan Another Asset</Text>
            </TouchableOpacity>
          </BlurView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
    zIndex: 10
  },
  title: {
    color: '#F8FAFC',
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 16,
    marginTop: 5,
    fontWeight: '500'
  },
  permissionBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  permissionText: {
    color: '#F8FAFC',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20
  },
  grantButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
  cameraContainer: {
    flex: 1,
    overflow: 'hidden',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: 10
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanTarget: {
    width: width * 0.65,
    height: width * 0.65,
    backgroundColor: 'transparent',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#60A5FA',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  resultContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20
  },
  resultBox: {
    width: '100%',
    padding: 30,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden'
  },
  successBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#10B981'
  },
  successIcon: {
    color: '#10B981',
    fontSize: 30,
    fontWeight: 'bold'
  },
  successText: {
    color: '#10B981',
    fontSize: 22,
    fontWeight: 'bold'
  },
  assetTag: {
    color: '#fff',
    fontSize: 52,
    fontWeight: '900',
    marginTop: 10,
    marginBottom: 30,
    letterSpacing: 2
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.8)'
  },
  cardTitle: {
    color: '#FCD34D',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 15,
    letterSpacing: 1
  },
  cardText: {
    color: '#CBD5E1',
    fontSize: 16,
    marginBottom: 8,
    lineHeight: 24
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 8,
  },
  offlineTag: {
    color: '#F59E0B',
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
  resetButton: {
    marginTop: 40,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  }
});
