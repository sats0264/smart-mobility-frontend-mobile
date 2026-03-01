import { useRouter } from 'expo-router';
import { Calendar, ChevronLeft, Train, Zap } from 'lucide-react-native';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '../components/Button';
import { Colors } from '../constants/Colors';

export default function AbonnementScreen() {
    const router = useRouter();

    const subscriptions = [
        { id: '1', title: 'Pass Mensuel TER', route: 'Dakar → Diamniadio', expiry: 'Expire le 15 Mai', icon: Train },
        { id: '2', title: 'Pass Hebdo BRT', route: 'Toutes Zones', expiry: 'Expire le 20 Mai', icon: Zap },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <ChevronLeft size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Abonnements</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.sectionTitle}>Vos pass actifs</Text>

                {subscriptions.map(sub => (
                    <View key={sub.id} style={styles.subCard}>
                        <View style={styles.subTop}>
                            <View style={styles.iconBox}>
                                <sub.icon size={30} color={Colors.primary} />
                            </View>
                            <View style={styles.subMain}>
                                <Text style={styles.subTitle}>{sub.title}</Text>
                                <Text style={styles.subRoute}>{sub.route}</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.subBottom}>
                            <View style={styles.infoRow}>
                                <Calendar size={16} color={Colors.textSecondary} />
                                <Text style={styles.infoText}>{sub.expiry}</Text>
                            </View>
                            <TouchableOpacity style={styles.manageBtn}>
                                <Text style={styles.manageBtnText}>Gérer</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}

                <View style={styles.buyCard}>
                    <Text style={styles.buyTitle}>Besoin d'un pass ?</Text>
                    <Text style={styles.buyDesc}>Achetez un nouveau ticket ou un abonnement pour vos prochains trajets.</Text>
                    <Button
                        title="Acheter maintenant"
                        onPress={() => router.push('/pass')}
                        style={styles.buyBtn}
                    />
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
        padding: 24,
        paddingTop: 40,
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
    content: {
        padding: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.text,
        marginBottom: 20,
    },
    subCard: {
        backgroundColor: Colors.white,
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    subTop: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    iconBox: {
        width: 60,
        height: 60,
        borderRadius: 15,
        backgroundColor: Colors.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    subMain: {
        flex: 1,
    },
    subTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.text,
        marginBottom: 4,
    },
    subRoute: {
        fontSize: 13,
        color: Colors.textSecondary,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border,
        marginBottom: 16,
    },
    subBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoText: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginLeft: 8,
        fontWeight: '600',
    },
    manageBtn: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 10,
        backgroundColor: Colors.secondary,
    },
    manageBtnText: {
        fontSize: 12,
        fontWeight: '800',
        color: Colors.primary,
    },
    buyCard: {
        backgroundColor: Colors.primary,
        borderRadius: 24,
        padding: 24,
        marginTop: 20,
    },
    buyTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: Colors.white,
        marginBottom: 8,
    },
    buyDesc: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 24,
        lineHeight: 20,
    },
    buyBtn: {
        backgroundColor: Colors.white,
    },
});
