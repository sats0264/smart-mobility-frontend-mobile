import { Bus, ChevronRight, Clock, MapPin, Train, Zap } from 'lucide-react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, RefreshControl } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { JourneyService } from '../../services/api';
import { useRouter } from 'expo-router';

export default function HistoriqueScreen() {
    const { user, isLoading: authLoading } = useAuth();
    const [history, setHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    const fetchHistory = useCallback(async (showLoading = true) => {
        if (!user?.id) {
            if (!authLoading) setIsLoading(false);
            return;
        }
        if (showLoading) setIsLoading(true);
        try {
            const data = await JourneyService.getHistory(user.id);
            const sorted = (data || []).sort((a: any, b: any) =>
                new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
            );
            setHistory(sorted);
        } catch (error) {
            console.error("Failed to fetch history", error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [user?.id, authLoading]);

    useEffect(() => {
        if (!authLoading) {
            fetchHistory(true);
        }
    }, [authLoading, fetchHistory]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchHistory(false);
    }, [fetchHistory]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    };

    const formatTime = (start: string, end: string) => {
        const s = new Date(start).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        if (!end) return `${s} - En cours`;
        const e = new Date(end).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        return `${s} - ${e}`;
    };

    const getTransportTheme = (type: string) => {
        const t = (type || '').toUpperCase();
        if (t === 'TER') return { color: '#6366F1', icon: Train, name: 'TER' };
        if (t === 'BRT') return { color: '#F59E0B', icon: Zap, name: 'BRT' };
        if (t === 'BUS') return { color: '#3B82F6', icon: Bus, name: 'BUS' };
        return { color: Colors.primary, icon: Bus, name: type };
    };

    const renderItem = ({ item }: { item: any }) => {
        const theme = getTransportTheme(item.transportType);

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.typeRow}>
                        <View style={[styles.iconBox, { backgroundColor: theme.color + '15' }]}>
                            <theme.icon size={20} color={theme.color} />
                        </View>
                        <Text style={styles.cardTitle}>{theme.name} - Ligne {item.transportLineId}</Text>
                    </View>
                    <Text style={styles.cardDate}>{formatDate(item.startTime)}</Text>
                </View>

                <View style={styles.cardBody}>
                    <View style={styles.infoRow}>
                        <MapPin size={16} color={Colors.textSecondary} />
                        <Text style={styles.infoText}>{item.startLocation} {item.endLocation ? `→ ${item.endLocation}` : ''}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Clock size={16} color={Colors.textSecondary} />
                        <Text style={styles.infoText}>{formatTime(item.startTime, item.endTime)}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.cardFooter}>
                    <Text style={[styles.status, item.status === 'STARTED' && { color: '#EAB308' }]}>
                        {item.status === 'STARTED' ? 'EN COURS' : 'TERMINÉ'}
                    </Text>
                    <TouchableOpacity
                        style={styles.detailBtn}
                        onPress={() => router.push({
                            pathname: '/journey_details',
                            params: { tripId: item.id }
                        })}
                    >
                        <Text style={[styles.detailBtnText, { color: theme.color }]}>Détails</Text>
                        <ChevronRight size={16} color={theme.color} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Historique</Text>
            </View>

            {isLoading ? (
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={history}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Aucun trajet enregistré.</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        padding: 24,
        paddingTop: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: Colors.text,
    },
    list: {
        padding: 24,
        paddingTop: 0,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    typeRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: Colors.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.text,
    },
    cardDate: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    cardBody: {
        marginBottom: 20,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginLeft: 8,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border,
        marginBottom: 16,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    price: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.text,
    },
    status: {
        fontSize: 14,
        fontWeight: '900',
        color: '#22C55E',
    },
    detailBtn: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailBtnText: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.primary,
        marginRight: 4,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyText: {
        color: Colors.textSecondary,
        fontSize: 16,
        fontWeight: '600',
    }
});
