import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { LoginScreen } from './screens/LoginScreen';
import { HomeScreen } from './screens/HomeScreen';
import { QRScanScreen } from './screens/QRScanScreen';
import { EquipmentListScreen } from './screens/EquipmentListScreen';
import { EquipmentDetailScreen } from './screens/EquipmentDetailScreen';
import { EquipmentHistoryScreen } from './screens/EquipmentHistoryScreen';
import { DocumentsUploadScreen } from './screens/DocumentsUploadScreen';
import { DocumentsListScreen } from './screens/DocumentsListScreen';
import { ComplianceListScreen } from './screens/ComplianceListScreen';
import { LiveMetricsScreen } from './screens/LiveMetricsScreen';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('Home');
  const [navigationStack, setNavigationStack] = useState([]);
  const [screenParams, setScreenParams] = useState({});

  const handleLogin = (userData) => {
    setIsLoggedIn(true);
  };

  const navigateTo = (screen, params = {}) => {
    setNavigationStack([...navigationStack, { screen: currentScreen, params: screenParams }]);
    setCurrentScreen(screen);
    setScreenParams(params);
  };

  const navigateBack = () => {
    if (navigationStack.length > 0) {
      const previous = navigationStack[navigationStack.length - 1];
      setNavigationStack(navigationStack.slice(0, -1));
      setCurrentScreen(previous.screen);
      setScreenParams(previous.params);
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Home':
        return <HomeScreen />;
      case 'QRScan':
        return <QRScanScreen />;
      case 'Equipment':
        return <EquipmentListScreen onNavigateToDetail={(tag) => navigateTo('EquipmentDetail', { tag })} />;
      case 'EquipmentDetail':
        return (
          <EquipmentDetailScreen
            tag={screenParams.tag}
            onNavigateToHistory={(tag) => navigateTo('EquipmentHistory', { tag })}
            onBack={navigateBack}
          />
        );
      case 'EquipmentHistory':
        return <EquipmentHistoryScreen tag={screenParams.tag} onBack={navigateBack} />;
      case 'Documents':
        return <DocumentsUploadScreen onUploadComplete={() => navigateTo('DocumentsList')} />;
      case 'DocumentsList':
        return <DocumentsListScreen onNavigateToDetail={(docId) => navigateTo('DocumentDetail', { docId })} />;
      case 'Compliance':
        return <ComplianceListScreen onNavigateToCertificate={(certId) => navigateTo('CertificateDetail', { certId })} />;
      case 'Metrics':
        return <LiveMetricsScreen />;
      default:
        return <HomeScreen />;
    }
  };

  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient 
          colors={['#0B0E14', '#1E1B4B', '#0F172A']} 
          style={StyleSheet.absoluteFillObject}
        />
        <LoginScreen onLoginSuccess={handleLogin} />
      </View>
    );
  }

  const showBackButton = navigationStack.length > 0 && !['Home', 'QRScan', 'Equipment', 'Documents', 'Compliance', 'Metrics'].includes(currentScreen);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient 
        colors={['#0B0E14', '#1E1B4B', '#0F172A']} 
        style={StyleSheet.absoluteFillObject}
      />
      
      {showBackButton && (
        <View style={styles.backButtonContainer}>
          <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {renderScreen()}
      
      {/* Premium Glass Bottom Navigation */}
      <View style={styles.navContainer}>
        <BlurView intensity={80} tint="dark" style={styles.navBar}>
          <TouchableOpacity 
            style={[styles.navTab, currentScreen === 'Home' && styles.activeTab]} 
            onPress={() => setCurrentScreen('Home')}
            activeOpacity={0.7}
          >
            <Text style={styles.icon}>{currentScreen === 'Home' ? '💬' : '💭'}</Text>
            <Text style={[styles.navText, currentScreen === 'Home' && styles.navTextActive]}>AI</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.navTab, currentScreen === 'QRScan' && styles.activeTab]} 
            onPress={() => setCurrentScreen('QRScan')}
            activeOpacity={0.7}
          >
            <Text style={styles.icon}>{currentScreen === 'QRScan' ? '📷' : '📸'}</Text>
            <Text style={[styles.navText, currentScreen === 'QRScan' && styles.navTextActive]}>Scan</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.navTab, currentScreen === 'Equipment' && styles.activeTab]} 
            onPress={() => setCurrentScreen('Equipment')}
            activeOpacity={0.7}
          >
            <Text style={styles.icon}>{currentScreen === 'Equipment' ? '⚙️' : '⚙'}</Text>
            <Text style={[styles.navText, currentScreen === 'Equipment' && styles.navTextActive]}>Assets</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.navTab, currentScreen === 'Documents' && styles.activeTab]} 
            onPress={() => setCurrentScreen('Documents')}
            activeOpacity={0.7}
          >
            <Text style={styles.icon}>{currentScreen === 'Documents' ? '📄' : '📃'}</Text>
            <Text style={[styles.navText, currentScreen === 'Documents' && styles.navTextActive]}>Docs</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.navTab, currentScreen === 'Compliance' && styles.activeTab]} 
            onPress={() => setCurrentScreen('Compliance')}
            activeOpacity={0.7}
          >
            <Text style={styles.icon}>{currentScreen === 'Compliance' ? '✅' : '☑'}</Text>
            <Text style={[styles.navText, currentScreen === 'Compliance' && styles.navTextActive]}>Cert</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.navTab, currentScreen === 'Metrics' && styles.activeTab]} 
            onPress={() => setCurrentScreen('Metrics')}
            activeOpacity={0.7}
          >
            <Text style={styles.icon}>{currentScreen === 'Metrics' ? '📊' : '📈'}</Text>
            <Text style={[styles.navText, currentScreen === 'Metrics' && styles.navTextActive]}>Live</Text>
          </TouchableOpacity>
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backButtonContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1000,
  },
  backButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.4)',
  },
  backButtonText: {
    color: '#60A5FA',
    fontSize: 16,
    fontWeight: '700',
  },
  navContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 25,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'transparent',
  },
  navBar: {
    flexDirection: 'row',
    height: 70,
    alignItems: 'center',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    borderRadius: 35,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%'
  },
  activeTab: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  icon: {
    fontSize: 22,
    marginBottom: 4
  },
  navText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  navTextActive: {
    color: '#60A5FA',
    fontWeight: '800'
  }
});
