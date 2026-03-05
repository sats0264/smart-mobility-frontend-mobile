import { useRouter } from 'expo-router';
import { AlertTriangle, CheckCircle2, ChevronLeft, Info, BellOff } from 'lucide-react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, RefreshControl } from 'react-native';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import { NotificationService } from '../services/api';

export default function NotificationsScreen() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const getNotifConfig = (type: string) => {
        switch (type) {
            case 'PAYMENT':
                return { icon: CheckCircle2, color: '#22C55E', title: 'Paiement' };
            case 'ACCOUNT_CREDITED':
                return { icon: CheckCircle2, color: Colors.primary, title: 'Rechargement' };
            case 'LOW_BALANCE':
                return { icon: AlertTriangle, color: Colors.warning, title: 'Solde Faible' };
            default:
                return { icon: Info, color: Colors.textSecondary, title: 'Information' };
        }
    };

    const fetchNotifications = useCallback(async (showLoading = true) => {
        if (!user?.id) {
            if (!authLoading) setIsLoading(false);
            return;
        }
        if (showLoading) setIsLoading(true);
        try {
            const data = await NotificationService.getUserNotifications(user.id);
            setNotifications(data || []);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [user?.id, authLoading]);

    useEffect(() => {
        if (!authLoading) {
            fetchNotifications(true);
        }
    }, [authLoading, fetchNotifications]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchNotifications(false);
    }, [fetchNotifications]);

    const formatTimeAgo = (dateString: string) => {
        const now = new Date();
        const past = new Date(dateString);
        const diffMs = now.getTime() - past.getTime();
        const diffMin = Math.round(diffMs / 60000);

        if (diffMin < 60) return `Il y a ${diffMin} min`;
        const diffHr = Math.round(diffMin / 60);
        if (diffHr < 24) return `Il y a ${diffHr}h`;
        return past.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <ChevronLeft size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Notifications</Text>
            </View>

            {isLoading ? (
                <View style={styles.loadingBox}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
                    }
                    renderItem={({ item }) => {
                        const config = getNotifConfig(item.type);
                        return (
                            <View style={styles.notifItem}>
                                <View style={[styles.iconBox, { backgroundColor: config.color + '15' }]}>
                                    <config.icon size={24} color={config.color} />
                                </View>
                                <View style={styles.notifContent}>
                                    <View style={styles.notifHeader}>
                                        <Text style={styles.notifTitle}>{config.title}</Text>
                                        <Text style={styles.notifDate}>{formatTimeAgo(item.createdAt)}</Text>
                                    </View>
                                    <Text style={styles.notifMessage}>{item.message}</Text>
                                </View>
                            </View>
                        );
                    }}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyBox}>
                            <BellOff size={48} color={Colors.border} />
                            <Text style={styles.emptyText}>Aucune notification</Text>
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
        flexDirection: 'row',
        alignItems: 'center',
        padding: 24,
    },
    backBtn: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        elevation: 2,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: Colors.text,
    },
    listContent: {
        padding: 24,
        paddingTop: 0,
    },
    notifItem: {
        flexDirection: 'row',
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
        alignItems: 'center',
        elevation: 1,
    },
    iconBox: {
        width: 50,
        height: 50,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    notifContent: {
        flex: 1,
    },
    notifHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    notifTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: Colors.text,
    },
    notifDate: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    notifMessage: {
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 20,
    },
    loadingBox: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyBox: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyText: {
        fontSize: 16,
        color: Colors.textSecondary,
        marginTop: 12,
        fontWeight: '600',
    },
});
