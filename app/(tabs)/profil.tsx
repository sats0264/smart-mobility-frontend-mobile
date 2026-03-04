import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image, RefreshControl } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/Colors';
import { User, Mail, LogOut, ChevronRight, Wallet, History, Settings, Shield } from 'lucide-react-native';
import { Button } from '../../components/Button';
import { BillingService, JourneyService, UserService } from "@/services/api";
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Zap, Train, PlusCircle } from 'lucide-react-native';

export default function ProfileScreen() {
    const { user, logout, isLoading: authLoading } = useAuth();

    // States
    const [balance, setBalance] = useState<number>(0);
    const [dailySpent, setDailySpent] = useState<number>(0);
    const [summary, setSummary] = useState<any>(null);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    const displayUser = {
        name: user ? `${user.firstName} ${user.lastName}` : 'Utilisateur',
        email: user?.email || 'non renseigné',
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!user || authLoading) return;
            try {
                // Fetch financial data from Billing-Service
                const acct = await BillingService.getAccount(user.id);
                setBalance(acct.balance || 0);
                setDailySpent(acct.dailySpent || 0);

                // Fetch Summary
                const userSummary = await UserService.getSummary(user.id);
                setSummary(userSummary);
            } catch (error) {
                console.error("Profile: Failed to fetch data", error);
            }
        };
        fetchData();
    }, [user, authLoading]);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        const fetchData = async () => {
            if (!user) return;
            try {
                const acct = await BillingService.getAccount(user.id);
                setBalance(acct.balance || 0);
                setDailySpent(acct.dailySpent || 0);
                const userSummary = await UserService.getSummary(user.id);
                setSummary(userSummary);
            } catch (error) {
                console.error("Profile refresh error", error);
            } finally {
                setRefreshing(false);
            }
        };
        fetchData();
    }, [user]);

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const MenuItem = ({ icon: Icon, title, subtitle, onPress, destructive = false }: any) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={[styles.menuIconBox, destructive && styles.destructiveIconBox]}>
                <Icon size={20} color={destructive ? Colors.error : Colors.primary} />
            </View>
            <View style={styles.menuTextContent}>
                <Text style={[styles.menuTitle, destructive && styles.destructiveText]}>{title}</Text>
                {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
            </View>
            <ChevronRight size={20} color={Colors.border} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
                }
            >
                <View style={styles.header}>
                    <View style={styles.profileInfo}>
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{displayUser.name.charAt(0)}</Text>
                            </View>
                            <TouchableOpacity style={styles.editBadge}>
                                <Settings size={14} color={Colors.white} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.name}>{displayUser.name}</Text>
                        <View style={styles.emailContainer}>
                            <Mail size={14} color={Colors.textSecondary} />
                            <Text style={styles.email}>{displayUser.email}</Text>
                        </View>
                    </View>

                    <View style={styles.statsContainer}>
                        <View style={styles.statCard}>
                            <Wallet size={20} color={Colors.primary} />
                            <Text style={styles.statValue}>{authLoading ? '...' : balance.toLocaleString('fr-FR')} F</Text>
                            <Text style={styles.statLabel}>Solde</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statCard}>
                            <History size={20} color="#FF9933" />
                            <Text style={styles.statValue}>{authLoading ? '...' : dailySpent.toLocaleString('fr-FR')} F</Text>
                            <Text style={styles.statLabel}>Dépensé aujourd'hui</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Ma Mobilité</Text>
                    <View style={styles.menuCard}>
                        <MenuItem
                            icon={PlusCircle}
                            title="Recharger mon compte"
                            subtitle="Ajouter du crédit pour vos trajets"
                            onPress={() => router.push('/recharge')}
                        />
                        <View style={styles.divider} />
                        <MenuItem
                            icon={History}
                            title="Historique des recharges"
                            subtitle="Voir vos transactions passées"
                            onPress={() => router.push('/recharge_history')}
                        />
                    </View>
                </View>

                {/* Mes Avantages (Pass & Subscriptions) */}
                {(summary?.hasActivePass || (summary?.activeSubscriptions && summary.activeSubscriptions.length > 0)) && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Mes Avantages Actifs</Text>
                        {summary.hasActivePass && (
                            <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.perkCard}>
                                <Zap size={20} color={Colors.white} />
                                <View style={styles.perkContent}>
                                    <Text style={styles.perkTitle}>Pass Mobilité {summary.passType}</Text>
                                    <Text style={styles.perkDesc}>Rapporté au plafond journalier de {summary.dailyCap} F</Text>
                                </View>
                            </LinearGradient>
                        )}
                        {summary.activeSubscriptions?.map((sub: any, idx: number) => (
                            <LinearGradient key={idx} colors={['#EC4899', '#DB2777']} style={[styles.perkCard, { marginTop: 8 }]}>
                                <Train size={20} color={Colors.white} />
                                <View style={styles.perkContent}>
                                    <Text style={styles.perkTitle}>{sub.offerName}</Text>
                                    <Text style={styles.perkDesc}>{sub.subscriptionType} • -{sub.discountPercentage}% sur {sub.applicableTransport}</Text>
                                </View>
                            </LinearGradient>
                        ))}
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Compte</Text>
                    <View style={styles.menuCard}>
                        <MenuItem icon={User} title="Modifier le profil" subtitle="Nom, photo, téléphone" />
                        <View style={styles.divider} />
                        <MenuItem icon={Shield} title="Sécurité" subtitle="Mot de passe, biométrie" />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Préférences</Text>
                    <View style={styles.menuCard}>
                        <MenuItem icon={Settings} title="Paramètres" subtitle="Langue, thèmes, notifications" />
                    </View>
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <View style={[styles.menuIconBox, styles.destructiveIconBox]}>
                        <LogOut size={20} color={Colors.error} />
                    </View>
                    <Text style={styles.logoutText}>Se déconnecter</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>Version 1.0.0 (Beta)</Text>
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
        backgroundColor: Colors.primary,
        paddingTop: 40,
        paddingBottom: 30,
        alignItems: 'center',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    profileInfo: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
    },
    avatarText: {
        fontSize: 40,
        fontWeight: '900',
        color: Colors.primary,
    },
    editBadge: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: Colors.accent,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: Colors.primary,
    },
    name: {
        fontSize: 22,
        fontWeight: '800',
        color: Colors.white,
        marginBottom: 4,
    },
    emailContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    email: {
        color: Colors.white,
        fontSize: 13,
        marginLeft: 6,
        fontWeight: '500',
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: Colors.white,
        width: '85%',
        borderRadius: 24,
        paddingVertical: 20,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        height: '60%',
        backgroundColor: Colors.border,
        alignSelf: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: '900',
        color: Colors.text,
        marginVertical: 4,
    },
    statLabel: {
        fontSize: 11,
        color: Colors.textSecondary,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    section: {
        marginTop: 24,
        paddingHorizontal: 24,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: Colors.text,
        marginBottom: 12,
        marginLeft: 4,
    },
    perkCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    perkContent: {
        flex: 1,
        marginLeft: 16,
    },
    perkTitle: {
        color: Colors.white,
        fontSize: 15,
        fontWeight: '900',
        marginBottom: 2,
    },
    perkDesc: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        fontWeight: '500',
    },
    menuCard: {
        backgroundColor: Colors.white,
        borderRadius: 24,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    menuIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: Colors.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    destructiveIconBox: {
        backgroundColor: '#FEE2E2',
    },
    menuTextContent: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.text,
    },
    menuSubtitle: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    destructiveText: {
        color: Colors.error,
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginLeft: 72,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 32,
        marginHorizontal: 24,
        padding: 16,
        backgroundColor: Colors.white,
        borderRadius: 24,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        marginBottom: 20,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '800',
        color: Colors.error,
    },
    versionText: {
        textAlign: 'center',
        color: Colors.textSecondary,
        fontSize: 12,
        marginBottom: 40,
    }
});
