import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  ArrowRight,
  Bus,
  Calendar,
  CheckCircle2,
  History,
  MapPin,
  QrCode,
  RefreshCw,
  Train,
  Zap
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, Animated, Dimensions, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, RefreshControl } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { JourneyService } from '../../services/api';

const { width } = Dimensions.get('window');

export default function ExploreScreen() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  // États du trajet
  const [status, setStatus] = useState<'idle' | 'scanning' | 'active' | 'finished'>('idle');
  const [currentTrip, setCurrentTrip] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  // Animation du point clignotant
  const dotOpacity = new Animated.Value(1);

  const loadData = async () => {
    if (!user?.id) return;
    try {
      // Check active trip
      const activeTrip = await JourneyService.getActiveJourney(user.id);
      if (activeTrip && activeTrip.id) {
        setCurrentTrip(activeTrip);
        setStatus('active');
      } else {
        setStatus('idle');
      }

      // Fetch history
      const hist = await JourneyService.getHistory(user.id);
      if (Array.isArray(hist)) {
        // En s'assurant que les plus récents sont en haut
        const sortedHist = [...hist].sort((a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );
        setHistory(sortedHist.slice(0, 2));
      }
    } catch (error) {
      console.error("Explore: Failed to load data", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [user?.id]);

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [user?.id, authLoading]);

  useEffect(() => {
    if (status === 'active') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dotOpacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
          Animated.timing(dotOpacity, { toValue: 1, duration: 800, useNativeDriver: true })
        ])
      ).start();
    }
  }, [status]);

  const getTransportTheme = (type: string) => {
    const t = (type || '').toUpperCase();
    if (t === 'TER') return { color: '#6366F1', icon: Train, name: 'TER Dakar' };
    if (t === 'BRT') return { color: '#F59E0B', icon: Zap, name: 'BRT Rapide' };
    if (t === 'BUS') return { color: '#3B82F6', icon: Bus, name: 'Bus DDD' };
    return { color: Colors.primary, icon: QrCode, name: 'Smart Scanner' };
  };

  const startScanning = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        alert("L'accès à la caméra est requis pour scanner le QR code.");
        return;
      }
    }
    setScanned(false);
    setStatus('scanning');
  };

  const cancelScanning = () => {
    setStatus(currentTrip ? 'active' : 'idle');
  };

  const handleBarcodeScanned = async ({ type: barcodeType, data }: { type: string, data: string }) => {
    if (scanned || !user?.id) return;
    setScanned(true); // Bloque les scans multiples

    try {
      const parsedData = JSON.parse(data);

      if (!parsedData.transportType) {
        alert("QR Code invalide : Type de transport manquant.");
        setScanned(false);
        return;
      }

      if (status === 'scanning' && !currentTrip) {
        // Global Check-in (Trust the QR code for transport type)
        const newTrip = await JourneyService.checkIn(
          user.id,
          parsedData.transportType.toUpperCase(),
          parsedData.stationName,
          parsedData.transportLineId
        );
        setCurrentTrip(newTrip);
        setStatus('active');
        loadData(); // refresh history
      } else if (status === 'scanning' && currentTrip) {
        // Check-out
        const scannedLineId = Number(parsedData.transportLineId);
        const currentLineId = Number(currentTrip.transportLineId);

        const performCheckOut = async () => {
          try {
            await JourneyService.checkOut(
              currentTrip.id,
              parsedData.stationName,
              parsedData.transportLineId
            );
            setStatus('finished');
            setCurrentTrip(null);
            loadData();
          } catch (error) {
            console.error("Check-out error:", error);
            alert("Erreur lors de la validation du trajet.");
            setScanned(false);
          }
        };

        // Si la ligne ne correspond pas, on demande confirmation
        if (scannedLineId !== currentLineId) {
          Alert.alert(
            "⚠️ Ligne différente détectée",
            `Vous avez commencé sur la ligne ${currentLineId} mais vous scannez la ligne ${scannedLineId}. 
            
Une pénalité forfaitaire sera appliquée si vous validez. Voulez-vous continuer ?`,
            [
              { text: "Annuler", onPress: () => setScanned(false), style: "cancel" },
              { text: "Valider avec pénalité", onPress: performCheckOut }
            ]
          );
          return;
        }

        // Si tout correspond
        await performCheckOut();
      }
    } catch (error) {
      console.error("Scan error:", error);
      alert("QR Code invalide ou erreur réseau. Veuillez réessayer.");
      setScanned(false);
    }
  };

  // Derived theme based on active trip or default to a generic theme
  const activeTheme = currentTrip ? getTransportTheme(currentTrip.transportType) : { color: Colors.primary, icon: QrCode, name: 'Smart Scanner' };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient
        colors={[activeTheme.color, activeTheme.color + 'DD']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>{activeTheme.name}</Text>
        <Text style={styles.headerSubtitle}>Validez votre titre de transport</Text>
      </LinearGradient>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
          }
        >


          {/* ZONE DE SCAN / BOUTON D'ACTION */}
          <View style={styles.actionSection}>
            {status === 'scanning' ? (
              <View style={styles.cameraContainer}>
                <CameraView
                  style={styles.camera}
                  facing="back"
                  onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
                  barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                  }}
                >
                  <View style={styles.cameraOverlay}>
                    <View style={styles.scanFrame} />
                    <Text style={styles.scanHelperText}>Placez le QR Code dans le cadre</Text>
                  </View>
                </CameraView>
                <TouchableOpacity style={styles.cancelScanBtn} onPress={cancelScanning}>
                  <Text style={styles.cancelScanLabel}>ANNULER LE SCAN</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.mainScanBtn,
                  { backgroundColor: status === 'active' ? '#EF4444' : activeTheme.color }
                ]}
                onPress={startScanning}
              >
                <Text style={styles.mainScanLabel}>
                  {status === 'active' ? 'TERMINER LE TRAJET (SCAN OUT)' : 'SCANNER POUR MONTER'}
                </Text>
                <QrCode size={24} color={Colors.white} />
              </TouchableOpacity>
            )}
          </View>

          {/* MODAL RÉSUMÉ FIN DE TRAJET */}
          {status === 'finished' && (
            <View style={styles.summaryContainer}>
              <View style={styles.summaryIconBox}>
                <CheckCircle2 size={40} color="#22C55E" />
              </View>
              <Text style={styles.summaryTitle}>Voyage Terminé !</Text>
              <Text style={styles.summaryDesc}>Votre trajet a été enregistré avec succès.</Text>
              <TouchableOpacity style={styles.summaryOkBtn} onPress={() => setStatus('idle')}>
                <Text style={styles.summaryOkLabel}>FERMER</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* HISTORIQUE RÉCENT */}
          {status !== 'scanning' && history.length > 0 && (
            <View style={styles.historySection}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyTitle}>Trajets récents</Text>
                <History size={18} color={Colors.textSecondary} />
              </View>

              {history.map((item, idx) => {
                const theme = getTransportTheme(item.transportType);
                return (
                  <TouchableOpacity
                    key={item.id || idx}
                    style={styles.historyCard}
                    onPress={() => router.push({
                      pathname: '/journey_details',
                      params: { tripId: item.id }
                    })}
                  >
                    <View style={[styles.historyIconBox, { backgroundColor: theme.color + '20' }]}>
                      <theme.icon size={20} color={theme.color} />
                    </View>
                    <View style={styles.historyContent}>
                      <Text style={styles.historyRoute}>{item.startLocation} ➔ {item.endLocation || 'En cours'}</Text>
                      <Text style={styles.historyMeta}>Ligne {item.assignedLine?.name || item.transportLineId}</Text>
                    </View>
                    <Text style={styles.historyStatus}>{item.status}</Text>
                  </TouchableOpacity>
                );
              })}

              <TouchableOpacity style={styles.viewMoreBtn} onPress={() => router.push('/historique')}>
                <Text style={styles.viewMoreLabel}>Voir tout l'historique</Text>
                <ArrowRight size={14} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          )}

        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 70,
    paddingBottom: 50,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: '900',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  actionSection: {
    padding: 24,
    marginTop: 20,
  },
  mainScanBtn: {
    height: 70,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 25,
    elevation: 4,
  },
  mainScanLabel: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '900',
  },
  cameraContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    height: 350,
    backgroundColor: '#000',
    elevation: 6,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 220,
    height: 220,
    borderWidth: 3,
    borderColor: Colors.white,
    backgroundColor: 'transparent',
    borderRadius: 24,
  },
  scanHelperText: {
    color: Colors.white,
    marginTop: 24,
    fontSize: 14,
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
  cancelScanBtn: {
    backgroundColor: '#EF4444',
    paddingVertical: 18,
    alignItems: 'center',
  },
  cancelScanLabel: {
    color: Colors.white,
    fontWeight: '900',
    fontSize: 14,
  },
  summaryContainer: {
    marginHorizontal: 24,
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#22C55E',
    marginBottom: 20,
  },
  summaryIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.text,
  },
  summaryDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },
  summaryOkBtn: {
    marginTop: 20,
    backgroundColor: '#22C55E',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  summaryOkLabel: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: 14,
  },
  historySection: {
    paddingHorizontal: 24,
    marginTop: 10,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.text,
  },
  historyCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  historyIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  historyContent: {
    flex: 1,
  },
  historyRoute: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
  },
  historyMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  historyStatus: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
    textTransform: 'uppercase',
  },
  viewMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  viewMoreLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
    marginRight: 6,
  }
});
