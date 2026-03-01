import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    ArrowRight,
    Bus,
    Calendar,
    CheckCircle2,
    ChevronLeft,
    History,
    MapPin,
    QrCode,
    RefreshCw,
    Train,
    Zap
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Animated, Dimensions, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';

const { width } = Dimensions.get('window');

/**
 * Screen inspiré de Maxit pour la gestion des titres de transport
 * Gère le cycle de vie d'un trajet : Scan -> Ticket Actif -> Résumé
 */
export default function VoyageControlScreen() {
    const router = useRouter();
    const { type } = useLocalSearchParams();

    // États du trajet
    const [status, setStatus] = useState<'idle' | 'scanning' | 'active' | 'finished'>('idle');
    const [startTime, setStartTime] = useState<string | null>(null);

    // Animation du point clignotant
    const dotOpacity = new Animated.Value(1);

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

    // Configuration selon le transport
    const transportData = {
        ter: { name: 'TER Dakar', color: '#0F56B3', icon: Train, sub: 'Pass Mensuel Liberté', price: 1200 },
        brt: { name: 'BRT Rapide', color: '#FF5733', icon: Zap, sub: 'Pass Hebdo Zone A', price: 800 },
        bus: { name: 'Bus DDD', color: '#47A0C7', icon: Bus, sub: 'Ticket Unitaire App', price: 500 },
    }[type as string] || { name: 'Transport', color: Colors.primary, icon: Bus, sub: 'Aucun abonnement', price: 0 };

    const handleScan = () => {
        if (status === 'idle') {
            setStatus('scanning');
            // Simulation scan début
            setTimeout(() => {
                setStartTime(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
                setStatus('active');
            }, 1500);
        } else if (status === 'active') {
            setStatus('scanning');
            // Simulation scan fin
            setTimeout(() => {
                setStatus('finished');
            }, 1500);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header Premium */}
            <View style={[styles.header, { backgroundColor: transportData.color }]}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <ChevronLeft size={24} color={Colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{transportData.name}</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* CARTE PASS DIGITALE (Style Maxit) */}
                <View style={styles.passCardWrapper}>
                    <LinearGradient
                        colors={[transportData.color, transportData.color + 'DD']}
                        style={styles.passCard}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.passTop}>
                            <View style={styles.passInfo}>
                                <Text style={styles.passLabel}>STATUT ABONNEMENT</Text>
                                <Text style={styles.passType}>{transportData.sub}</Text>
                            </View>
                            <View style={styles.passIconCircle}>
                                <transportData.icon size={28} color={Colors.white} />
                            </View>
                        </View>

                        <View style={styles.expiryBox}>
                            <Calendar size={14} color="rgba(255,255,255,0.7)" />
                            <Text style={styles.expiryText}>Expire le : <Text style={styles.expiryDate}>12 Juin 2026</Text></Text>
                        </View>

                        <View style={styles.qrContainer}>
                            <View style={styles.qrWhiteCanvas}>
                                <QrCode size={130} color={transportData.color} />
                                {status === 'active' && (
                                    <View style={styles.activeLabelOverlay}>
                                        <Animated.View style={[styles.liveDot, { opacity: dotOpacity }]} />
                                        <Text style={styles.liveLabel}>TRAJET EN COURS</Text>
                                    </View>
                                )}
                            </View>
                            <Text style={styles.qrHelper}>Scannez le code aux bornes</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.renewQuickBtn}
                            onPress={() => router.push({ pathname: '/renew', params: { type } })}
                        >
                            <RefreshCw size={18} color={transportData.color} />
                            <Text style={[styles.renewQuickText, { color: transportData.color }]}>RENOUVELER</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </View>

                {/* BOUTON D'ACTION PRINCIPALE */}
                <View style={styles.actionSection}>
                    <TouchableOpacity
                        style={[
                            styles.mainScanBtn,
                            { backgroundColor: status === 'active' ? '#EF4444' : transportData.color }
                        ]}
                        onPress={handleScan}
                        disabled={status === 'scanning'}
                    >
                        {status === 'scanning' ? (
                            <Text style={styles.mainScanLabel}>IDENTIFICATION...</Text>
                        ) : (
                            <>
                                <Text style={styles.mainScanLabel}>
                                    {status === 'active' ? 'TERMINER LE TRAJET' : 'SCANNER POUR MONTER'}
                                </Text>
                                <QrCode size={24} color={Colors.white} />
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {/* MODAL RÉSUMÉ FIN DE TRAJET */}
                {status === 'finished' && (
                    <View style={styles.summaryContainer}>
                        <View style={styles.summaryIconBox}>
                            <CheckCircle2 size={40} color="#22C55E" />
                        </View>
                        <Text style={styles.summaryTitle}>Voyage Terminé !</Text>
                        <Text style={styles.summaryDesc}>Tarif appliqué : <Text style={{ fontWeight: '900', color: Colors.text }}>{transportData.price} F</Text></Text>
                        <TouchableOpacity style={styles.summaryOkBtn} onPress={() => setStatus('idle')}>
                            <Text style={styles.summaryOkLabel}>COMPRIS</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* HISTORIQUE RÉCENT */}
                <View style={styles.historySection}>
                    <View style={styles.historyHeader}>
                        <Text style={styles.historyTitle}>Historique des trajets</Text>
                        <History size={18} color={Colors.textSecondary} />
                    </View>

                    {[
                        { from: 'Gare de Dakar', to: 'Diamniadio', date: 'Aujourd\'hui', time: '08:45' },
                        { from: 'Rufisque', to: 'Dakar', date: 'Hier', time: '17:30' }
                    ].map((item, idx) => (
                        <View key={idx} style={styles.historyCard}>
                            <View style={styles.historyIconBox}>
                                <MapPin size={18} color={transportData.color} />
                            </View>
                            <View style={styles.historyContent}>
                                <Text style={styles.historyRoute}>{item.from} ➔ {item.to}</Text>
                                <Text style={styles.historyMeta}>{item.date} • {item.time}</Text>
                            </View>
                            <Text style={styles.historyStatus}>Payé</Text>
                        </View>
                    ))}

                    <TouchableOpacity style={styles.viewMoreBtn} onPress={() => router.push('/(tabs)/historique')}>
                        <Text style={styles.viewMoreLabel}>Voir tout l'historique</Text>
                        <ArrowRight size={14} color={Colors.primary} />
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        paddingTop: 50,
        paddingBottom: 60,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        color: Colors.white,
        fontSize: 20,
        fontWeight: '900',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    passCardWrapper: {
        marginTop: -40,
        paddingHorizontal: 20,
    },
    passCard: {
        borderRadius: 32,
        padding: 24,
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 15,
    },
    passTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    passInfo: {
        flex: 1,
    },
    passLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: 'rgba(255,255,255,0.6)',
        letterSpacing: 1,
    },
    passType: {
        fontSize: 22,
        fontWeight: '900',
        color: Colors.white,
        marginTop: 4,
    },
    passIconCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    expiryBox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
    },
    expiryText: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.7)',
        marginLeft: 8,
    },
    expiryDate: {
        fontWeight: '800',
        color: Colors.white,
    },
    qrContainer: {
        alignItems: 'center',
        marginBottom: 25,
    },
    qrWhiteCanvas: {
        backgroundColor: Colors.white,
        padding: 15,
        borderRadius: 24,
        elevation: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeLabelOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.92)',
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    liveDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#22C55E',
        marginBottom: 8,
    },
    liveLabel: {
        fontSize: 12,
        fontWeight: '900',
        color: '#22C55E',
    },
    qrHelper: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        marginTop: 10,
        fontWeight: '600',
    },
    renewQuickBtn: {
        backgroundColor: Colors.white,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 18,
    },
    renewQuickText: {
        fontSize: 14,
        fontWeight: '900',
        marginLeft: 10,
    },
    actionSection: {
        padding: 24,
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
        fontSize: 16,
        fontWeight: '900',
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
        marginTop: 20,
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
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    historyIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F8FAFC',
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
        marginTop: 2,
    },
    historyStatus: {
        fontSize: 12,
        fontWeight: '800',
        color: '#22C55E',
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
