import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { BadgeCheck, Calendar, ChevronLeft, CreditCard, Sparkles, Train, Zap, Bus } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, RefreshControl } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { apiClient, CatalogService, ENDPOINTS } from '../../services/api';

const MOCK_CATALOG = [
    {
        id: 'pass-univ-hebdo',
        name: 'Pass Universel Hebdomadaire',
        price: 3500,
        durationDays: 7,
        description: 'Accès illimité à tous les moyens de transport (TER, BRT, Bus) pendant 7 jours.',
        color: Colors.primary,
        icon: Sparkles
    },
    {
        id: 'pass-ter-mensuel',
        name: 'Pass TER Mensuel',
        price: 15000,
        durationDays: 30,
        description: 'Accès illimité au TER Dakar-Diamniadio pendant tout le mois.',
        color: '#0F56B3',
        icon: Train
    },
    {
        id: 'pass-brt-mensuel',
        name: 'Pass BRT Mensuel',
        price: 10000,
        durationDays: 30,
        description: 'Profitez des voies réservées du BRT en illimité chaque mois.',
        color: '#FF5733',
        icon: Zap
    },
    {
        id: 'pass-bus-mensuel',
        name: 'Pass Bus Mensuel',
        price: 8000,
        durationDays: 30,
        description: 'Abonnement mensuel pour toutes les lignes urbaines Sénégal Dem Dikk.',
        color: '#47A0C7',
        icon: Bus
    }
];

export default function CatalogueScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [catalogItems, setCatalogItems] = useState<any[]>(MOCK_CATALOG);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedTab, setSelectedTab] = useState<'subscriptions' | 'passes'>('subscriptions');

    const mapOffer = (offer: any, type: 'subscription' | 'pass') => {
        const transport = (offer.applicableTransport || 'ALL').toUpperCase();

        let icon = Sparkles;
        let color = Colors.primary;

        if (transport === 'TER') {
            icon = Train;
            color = '#0F56B3';
        } else if (transport === 'BRT') {
            icon = Zap;
            color = '#FF5733';
        } else if (transport === 'BUS') {
            icon = Bus;
            color = '#47A0C7';
        }

        return {
            ...offer,
            id: `${type}-${offer.id}`, // Unique key fix
            type,
            durationDays: offer.validityDays || 0,
            icon,
            color
        };
    };

    useEffect(() => {
        const fetchCatalog = async () => {
            setIsLoading(true);
            try {
                // Fetch both subscriptions and passes
                const [subs, passes] = await Promise.all([
                    CatalogService.getCatalogSubscription(),
                    CatalogService.getCatalogPass()
                ]);

                const combinedOffers = [
                    ...(subs || []).map((s: any) => mapOffer(s, 'subscription')),
                    ...(passes || []).map((p: any) => mapOffer(p, 'pass'))
                ];

                if (combinedOffers.length > 0) {
                    setCatalogItems(combinedOffers);
                }
            } catch (e) {
                console.log("Catalogue API error, using mocks fallback.", e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCatalog();
    }, []);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        const fetchCatalog = async () => {
            try {
                const [subs, passes] = await Promise.all([
                    CatalogService.getCatalogSubscription(),
                    CatalogService.getCatalogPass()
                ]);

                const combinedOffers = [
                    ...(subs || []).map((s: any) => mapOffer(s, 'subscription')),
                    ...(passes || []).map((p: any) => mapOffer(p, 'pass'))
                ];

                if (combinedOffers.length > 0) {
                    setCatalogItems(combinedOffers);
                }
            } catch (e) {
                console.log("Catalogue refresh error", e);
            } finally {
                setRefreshing(false);
            }
        };
        fetchCatalog();
    }, []);

    const filteredItems = catalogItems.filter(item => {
        if (selectedTab === 'subscriptions') return item.type === 'subscription' || !item.type; // Fallback for mocks
        return item.type === 'pass';
    });

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={{ width: 44 }} />
                <Text style={styles.headerTitle}>Boutique Mobilité</Text>
                <View style={{ width: 44 }} />
            </View>

            {isLoading ? (
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <View style={{ flex: 1 }}>
                    {/* Tab Selector */}
                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[styles.tab, selectedTab === 'subscriptions' && styles.activeTab]}
                            onPress={() => setSelectedTab('subscriptions')}
                        >
                            <Text style={[styles.tabText, selectedTab === 'subscriptions' && styles.activeTabText]}>Abonnements</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, selectedTab === 'passes' && styles.activeTab]}
                            onPress={() => setSelectedTab('passes')}
                        >
                            <Text style={[styles.tabText, selectedTab === 'passes' && styles.activeTabText]}>Pass</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        contentContainerStyle={styles.content}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
                        }
                    >
                        <View style={styles.pageHeader}>
                            <Text style={styles.pageTitle}>
                                {selectedTab === 'subscriptions' ? 'Nos Abonnements' : 'Nos Pass Mobilité'}
                            </Text>
                            <Text style={styles.pageSubtitle}>
                                {selectedTab === 'subscriptions'
                                    ? 'Économisez sur vos trajets réguliers avec nos formules hebdomadaires et mensuelles.'
                                    : 'Achetez des pass prépayés avec un plafond de dépense quotidien garanti.'}
                            </Text>
                        </View>

                        {filteredItems.map((item) => (
                            <LinearGradient
                                key={item.id}
                                colors={[item.color, item.color + 'DD']}
                                style={styles.card}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <View style={styles.cardHeader}>
                                    <View style={styles.iconCircle}>
                                        <item.icon size={24} color={item.color} />
                                    </View>
                                    <View style={styles.priceTag}>
                                        <Text style={styles.priceText}>{item.price.toLocaleString('fr-FR')} F</Text>
                                    </View>
                                </View>

                                <Text style={styles.cardTitle}>{item.name}</Text>
                                <Text style={styles.cardDesc}>{item.description}</Text>

                                <View style={styles.cardFooter}>
                                    <View style={styles.metaInfo}>
                                        <Calendar size={14} color="rgba(255,255,255,0.7)" style={{ marginRight: 6 }} />
                                        <Text style={styles.metaText}>Valable {item.durationDays} jours</Text>
                                    </View>

                                    <TouchableOpacity style={styles.buyBtn}>
                                        <CreditCard size={16} color={item.color} />
                                        <Text style={[styles.buyBtnText, { color: item.color }]}>ACHETER</Text>
                                    </TouchableOpacity>
                                </View>
                            </LinearGradient>
                        ))}

                        {/* Note info */}
                        <View style={styles.infoBox}>
                            <BadgeCheck size={20} color={Colors.primary} />
                            <Text style={styles.infoText}>Les abonnements sont activés immédiatement après votre achat et s'appliquent sur l'ensemble de vos prochains trajets éligibles.</Text>
                        </View>
                    </ScrollView>
                </View>
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
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: Colors.white,
    },
    content: {
        padding: 24,
        paddingBottom: 60,
    },
    pageHeader: {
        marginBottom: 24,
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: Colors.text,
        marginBottom: 8,
    },
    pageSubtitle: {
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 20,
    },
    card: {
        borderRadius: 24,
        padding: 24,
        marginBottom: 20,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 15,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    iconCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    priceTag: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    priceText: {
        color: Colors.white,
        fontWeight: '900',
        fontSize: 16,
    },
    cardTitle: {
        color: Colors.white,
        fontSize: 22,
        fontWeight: '900',
        marginBottom: 8,
    },
    cardDesc: {
        color: 'rgba(255,255,255,0.85)',
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 24,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.2)',
        paddingTop: 16,
    },
    metaInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        color: Colors.white,
        fontSize: 13,
        fontWeight: '600',
    },
    buyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 14,
    },
    buyBtnText: {
        fontWeight: '900',
        fontSize: 13,
        marginLeft: 6,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#E0F2FE',
        padding: 16,
        borderRadius: 16,
        marginTop: 10,
    },
    infoText: {
        flex: 1,
        color: Colors.primary,
        fontSize: 13,
        marginLeft: 12,
        lineHeight: 18,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: Colors.white,
        marginHorizontal: 24,
        marginTop: 20,
        borderRadius: 16,
        padding: 6,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 12,
    },
    activeTab: {
        backgroundColor: Colors.primary,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.textSecondary,
    },
    activeTabText: {
        color: Colors.white,
    },
});
