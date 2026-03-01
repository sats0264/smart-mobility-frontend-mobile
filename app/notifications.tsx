import { useRouter } from 'expo-router';
import { AlertTriangle, CheckCircle2, ChevronLeft, Info } from 'lucide-react-native';
import React from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';

const NOTIFICATIONS = [
    { id: '1', title: 'Solde faible', message: 'Il vous reste moins de 2.000 CFA sur votre compte.', type: 'warning', date: 'Il y a 2h', icon: AlertTriangle, color: Colors.warning },
    { id: '2', title: 'Votre pass arrive à expiration', message: 'Pensez à renouveler votre pass TER avant demain.', type: 'info', date: 'Il y a 5h', icon: Info, color: Colors.primary },
    { id: '3', title: 'Voyage terminé', message: 'Merci d\'avoir utilisé le TER. 1.500 CFA ont été débités.', type: 'success', date: 'Hier', icon: CheckCircle2, color: Colors.success },
    { id: '4', title: 'Perturbation TER', message: 'Retards de 10 min prévus sur la ligne Dakar-Diamniadio.', type: 'warning', date: 'Hier', icon: AlertTriangle, color: Colors.error },
];

export default function NotificationsScreen() {
    const router = useRouter();



    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <ChevronLeft size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Notifications</Text>
            </View>

            <FlatList
                data={NOTIFICATIONS}
                renderItem={({ item }) => (
                    <View style={styles.notifItem}>
                        <View style={[styles.iconBox, { backgroundColor: item.color + '15' }]}>
                            <item.icon size={24} color={item.color} />
                        </View>
                        <View style={styles.notifContent}>
                            <View style={styles.notifHeader}>
                                <Text style={styles.notifTitle}>{item.title}</Text>
                                <Text style={styles.notifDate}>{item.date}</Text>
                            </View>
                            <Text style={styles.notifMessage}>{item.message}</Text>
                        </View>
                    </View>
                )}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
            />
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
});
