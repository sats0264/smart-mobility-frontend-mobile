import { useRouter } from 'expo-router';
import { ChevronLeft, CreditCard, QrCode, Smartphone } from 'lucide-react-native';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Button } from '../components/Button';
import { Colors } from '../constants/Colors';

export default function TicketScreen() {
    const router = useRouter();
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet'>('wallet');
    const [amount, setAmount] = useState('1500');

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <ChevronLeft size={24} color={Colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Ticket</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Carte de Ticket */}
                <View style={styles.ticketCard}>
                    <View style={styles.ticketMain}>
                        <View style={styles.row}>
                            <View style={styles.dotLine}>
                                <View style={[styles.dot, { backgroundColor: Colors.primary }]} />
                                <View style={styles.dashLine} />
                                <View style={styles.dot} />
                            </View>
                            <View style={styles.routeInfo}>
                                <View style={styles.stationGroup}>
                                    <Text style={styles.label}>Départ</Text>
                                    <Text style={styles.stationName}>Gare de Dakar</Text>
                                </View>
                                <View style={[styles.stationGroup, { marginTop: 24 }]}>
                                    <Text style={styles.label}>Arrivée</Text>
                                    <Text style={styles.stationName}>Diamniadio</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.ticketDetails}>
                            <View>
                                <Text style={styles.detailTime}>10:00 → 10:30</Text>
                                <Text style={styles.detailLocation}>Ligne TER</Text>
                                <Text style={styles.detailPrice}>1.500 F</Text>
                            </View>
                            <View style={styles.qrWrapper}>
                                <QrCode size={80} color={Colors.text} />
                            </View>
                        </View>
                    </View>
                </View>

                {/* Section Paiement */}
                <View style={styles.paymentSection}>
                    <Text style={styles.sectionTitle}>Paiement</Text>
                    <Text style={styles.inputLabel}>Saisir le montant</Text>
                    <View style={styles.amountInput}>
                        <Text style={styles.currency}>F CFA</Text>
                        <TextInput
                            style={styles.input}
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="decimal-pad"
                        />
                    </View>

                    <View style={styles.methodList}>
                        <TouchableOpacity
                            style={[styles.methodItem, paymentMethod === 'card' && styles.methodItemActive]}
                            onPress={() => setPaymentMethod('card')}
                        >
                            <View style={styles.methodRow}>
                                <View style={styles.methodIconBox}>
                                    <CreditCard size={20} color={paymentMethod === 'card' ? Colors.white : Colors.primary} />
                                </View>
                                <Text style={[styles.methodName, paymentMethod === 'card' && styles.methodTextActive]}>Carte Bancaire</Text>
                            </View>
                            <Text style={[styles.balanceText, paymentMethod === 'card' && styles.methodTextActive]}>Solde: 84.000 F</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.methodItem, paymentMethod === 'wallet' && styles.methodItemActive]}
                            onPress={() => setPaymentMethod('wallet')}
                        >
                            <View style={styles.methodRow}>
                                <View style={styles.methodIconBox}>
                                    <Smartphone size={20} color={paymentMethod === 'wallet' ? Colors.white : Colors.primary} />
                                </View>
                                <Text style={[styles.methodName, paymentMethod === 'wallet' && styles.methodTextActive]}>Portefeuille</Text>
                            </View>
                            <Text style={[styles.balanceText, paymentMethod === 'wallet' && styles.methodTextActive]}>Solde: 15.450 F</Text>
                        </TouchableOpacity>
                    </View>

                    <Button
                        title="Acheter le Ticket"
                        onPress={() => router.replace('/(tabs)/historique')}
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
        backgroundColor: Colors.primary,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 24,
        paddingTop: 40,
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 24,
        fontWeight: '800',
        color: Colors.white,
        marginRight: 40,
    },
    content: {
        padding: 24,
        paddingBottom: 40,
    },
    ticketCard: {
        backgroundColor: Colors.white,
        borderRadius: 24,
        padding: 24,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        marginBottom: 40,
    },
    ticketMain: {
    },
    row: {
        flexDirection: 'row',
        marginBottom: 30,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        paddingBottom: 24,
    },
    dotLine: {
        alignItems: 'center',
        marginRight: 20,
        paddingTop: 4,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.text,
    },
    dashLine: {
        width: 1,
        height: 50,
        backgroundColor: Colors.border,
        marginVertical: 4,
    },
    routeInfo: {
        flex: 1,
    },
    stationGroup: {
    },
    label: {
        fontSize: 10,
        color: Colors.textSecondary,
        marginBottom: 4,
    },
    stationName: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.text,
    },
    ticketDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detailTime: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 4,
    },
    detailLocation: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginBottom: 4,
    },
    detailPrice: {
        fontSize: 14,
        fontWeight: '800',
        color: Colors.primary,
    },
    qrWrapper: {
        padding: 8,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 12,
    },
    paymentSection: {
        backgroundColor: Colors.background,
        marginHorizontal: -24,
        marginBottom: -40,
        padding: 24,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        minHeight: 500,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: Colors.text,
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 12,
    },
    amountInput: {
        backgroundColor: '#EDF2F7',
        borderRadius: 16,
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 30,
    },
    currency: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.text,
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
    },
    methodList: {
        marginBottom: 40,
    },
    methodItem: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    methodItemActive: {
        backgroundColor: Colors.primary,
    },
    methodRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    methodIconBox: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#E0F2F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    methodName: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.text,
    },
    methodTextActive: {
        color: Colors.white,
    },
    balanceText: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    buyBtn: {
        height: 64,
    }
});
