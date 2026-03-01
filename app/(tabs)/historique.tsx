import { Bus, ChevronRight, Clock, MapPin, Train, Zap } from 'lucide-react-native';
import React from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';

const HISTORY = [
    { id: '1', title: 'TER - Train', from: 'Gare de Dakar', to: 'Diamniadio', time: '10:00 - 10:30', price: '1.500 F', date: 'Hier' },
    { id: '2', title: 'BRT - Ligne 1', from: 'Guédiawaye', to: 'Petersen', time: '08:15 - 09:00', price: '500 F', date: 'Hier' },
    { id: '3', title: 'Bus - Ligne 14', from: 'Plateau', to: 'Parcelles', time: '12:45 - 13:15', price: '400 F', date: '28 Fév' },
];

export default function HistoriqueScreen() {
    const renderItem = ({ item }: { item: typeof HISTORY[0] }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.typeRow}>
                    <View style={styles.iconBox}>
                        {item.title.includes('TER') ? <Train size={20} color={Colors.primary} /> :
                            item.title.includes('BRT') ? <Zap size={20} color={Colors.primary} /> :
                                <Bus size={20} color={Colors.primary} />}
                    </View>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                </View>
                <Text style={styles.cardDate}>{item.date}</Text>
            </View>

            <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                    <MapPin size={16} color={Colors.textSecondary} />
                    <Text style={styles.infoText}>{item.from} → {item.to}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Clock size={16} color={Colors.textSecondary} />
                    <Text style={styles.infoText}>{item.time}</Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.cardFooter}>
                <Text style={styles.price}>{item.price}</Text>
                <TouchableOpacity style={styles.detailBtn}>
                    <Text style={styles.detailBtnText}>Détails</Text>
                    <ChevronRight size={16} color={Colors.primary} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Historique</Text>
            </View>
            <FlatList
                data={HISTORY}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
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
    detailBtn: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailBtnText: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.primary,
        marginRight: 4,
    }
});
