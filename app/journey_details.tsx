import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { ArrowLeft, MapPin, Clock, Train, Bus, Zap, Receipt, Info, ShieldCheck, Tag } from 'lucide-react-native';
import { PricingService, JourneyService } from '../services/api';
import { LinearGradient } from 'expo-linear-gradient';

export default function JourneyDetailsScreen() {
    const { tripId } = useLocalSearchParams();
    const router = useRouter();
    const [journey, setJourney] = useState<any>(null);
    const [pricing, setPricing] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!tripId) return;
            try {
                // Fetch both journey and pricing in parallel
                const [journeyData, pricingData] = await Promise.all([
                    JourneyService.getJourney(Number(tripId)),
                    PricingService.getPricingByTripId(Number(tripId))
                ]);

                setJourney(journeyData);
                setPricing(pricingData);
            } catch (error) {
                console.error("Failed to fetch journey details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [tripId]);

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const formatTime = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Chargement des détails...</Text>
            </SafeAreaView>
        );
    }

    const appliedDiscounts = pricing?.appliedDiscounts ? JSON.parse(pricing.appliedDiscounts) : [];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Détails du Trajet</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Transport Type Header */}
                <LinearGradient
                    colors={pricing?.transportType === 'TER' ? ['#6366F1', '#4F46E5'] : pricing?.transportType === 'BRT' ? ['#F59E0B', '#D97706'] : ['#3B82F6', '#2563EB']}
                    style={styles.statusCard}
                >
                    <View style={styles.typeIconBox}>
                        {pricing?.transportType === 'TER' ? <Train size={32} color={Colors.white} /> :
                            pricing?.transportType === 'BRT' ? <Zap size={32} color={Colors.white} /> :
                                <Bus size={32} color={Colors.white} />}
                    </View>
                    <View>
                        <Text style={styles.statusLabel}>Transport</Text>
                        <Text style={styles.statusValue}>{pricing?.transportType || 'Inconnu'}</Text>
                    </View>
                </LinearGradient>

                {/* Trip Info */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Clock size={20} color={Colors.primary} />
                        <Text style={styles.sectionTitle}>Informations du Trajet</Text>
                    </View>
                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <View style={styles.dotLine}>
                                <View style={[styles.dot, { backgroundColor: Colors.primary }]} />
                                <View style={styles.line} />
                                <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
                            </View>
                            <View style={styles.locations}>
                                <View>
                                    <Text style={styles.locationLabel}>Origine</Text>
                                    <Text style={styles.locationValue}>{journey?.startLocation || 'Non spécifiée'}</Text>
                                    <Text style={styles.subTime}>{journey ? formatTime(journey.startTime) : ''}</Text>
                                </View>
                                <View style={{ height: 24 }} />
                                <View>
                                    <Text style={styles.locationLabel}>Destination</Text>
                                    <Text style={styles.locationValue}>{journey?.endLocation || 'En cours...'}</Text>
                                    <Text style={styles.subTime}>{journey?.endTime ? formatTime(journey.endTime) : ''}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.timeGrid}>
                            <View style={styles.timeItem}>
                                <Text style={styles.timeLabel}>Date</Text>
                                <Text style={styles.timeValue}>{pricing ? formatDate(pricing.computedAt) : '---'}</Text>
                            </View>
                            <View style={styles.timeItem}>
                                <Text style={styles.timeLabel}>ID Trajet</Text>
                                <Text style={styles.timeValue}>#{tripId}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Billing Info */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Receipt size={20} color={Colors.primary} />
                        <Text style={styles.sectionTitle}>Facturation & Remises</Text>
                    </View>
                    <View style={styles.billingCard}>
                        <View style={styles.billingRow}>
                            <Text style={styles.billingLabel}>Tarif de base</Text>
                            <Text style={styles.billingValue}>{pricing?.basePrice?.toLocaleString('fr-FR') || 0} F</Text>
                        </View>

                        {appliedDiscounts.length > 0 && (
                            <View style={styles.discountsList}>
                                {appliedDiscounts.map((disc: any, index: number) => (
                                    <View key={index} style={styles.discountItem}>
                                        <View style={styles.discountTag}>
                                            <Tag size={12} color="#16A34A" />
                                            <Text style={styles.discountText}>
                                                {disc.ruleType === 'DAILY_CAP' ? 'Plafond Journalier Atteint' :
                                                    disc.ruleType === 'SUBSCRIPTION' ? 'Réduction Abonnement' :
                                                        disc.ruleType === 'OFFPEAK' ? 'Heures Creuses' : disc.ruleType}
                                            </Text>
                                        </View>
                                        <Text style={styles.discountAmount}>-{disc.amountDeducted?.toLocaleString('fr-FR') || 0} F</Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        <View style={styles.totalDivider} />

                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Total payé</Text>
                            <Text style={styles.totalValue}>{pricing?.finalAmount?.toLocaleString('fr-FR') || 0} F</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.footerInfo}>
                    <ShieldCheck size={16} color={Colors.textSecondary} />
                    <Text style={styles.footerText}>Paiement sécurisé par votre compte Smart Mobility</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 20,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.text,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        color: Colors.textSecondary,
        fontWeight: '600',
    },
    scrollContent: {
        padding: 24,
    },
    statusCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 24,
        borderRadius: 28,
        marginBottom: 32,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
    },
    typeIconBox: {
        width: 64,
        height: 64,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 20,
    },
    statusLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    statusValue: {
        color: Colors.white,
        fontSize: 24,
        fontWeight: '900',
    },
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: Colors.text,
        marginLeft: 10,
    },
    infoCard: {
        backgroundColor: Colors.white,
        borderRadius: 24,
        padding: 24,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.05,
    },
    infoRow: {
        flexDirection: 'row',
    },
    dotLine: {
        alignItems: 'center',
        width: 20,
        marginRight: 16,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    line: {
        width: 2,
        height: 40,
        backgroundColor: '#F1F5F9',
        marginVertical: 4,
    },
    locations: {
        flex: 1,
    },
    locationLabel: {
        fontSize: 11,
        color: Colors.textSecondary,
        fontWeight: '600',
    },
    locationValue: {
        fontSize: 15,
        fontWeight: '800',
        color: Colors.text,
        marginTop: 2,
    },
    subTime: {
        fontSize: 11,
        color: Colors.textSecondary,
        fontWeight: '500',
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: 20,
    },
    timeGrid: {
        flexDirection: 'row',
    },
    timeItem: {
        flex: 1,
    },
    timeLabel: {
        fontSize: 11,
        color: Colors.textSecondary,
        fontWeight: '600',
    },
    timeValue: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.text,
        marginTop: 2,
    },
    billingCard: {
        backgroundColor: Colors.white,
        borderRadius: 24,
        padding: 24,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.05,
    },
    billingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    billingLabel: {
        fontSize: 14,
        color: Colors.textSecondary,
        fontWeight: '600',
    },
    billingValue: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.text,
    },
    discountsList: {
        marginTop: 16,
        backgroundColor: '#F0FDF4',
        borderRadius: 16,
        padding: 16,
    },
    discountItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    discountTag: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    discountText: {
        fontSize: 12,
        color: '#16A34A',
        fontWeight: '800',
        marginLeft: 6,
    },
    discountAmount: {
        fontSize: 13,
        color: '#16A34A',
        fontWeight: '900',
    },
    totalDivider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: 20,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: '900',
        color: Colors.text,
    },
    totalValue: {
        fontSize: 22,
        fontWeight: '900',
        color: Colors.primary,
    },
    footerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
    },
    footerText: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginLeft: 8,
        fontWeight: '500',
    }
});
