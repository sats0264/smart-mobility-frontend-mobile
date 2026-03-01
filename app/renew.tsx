import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    Check,
    CheckCircle2,
    ChevronLeft,
    CreditCard,
    Smartphone, Wallet
} from 'lucide-react-native';
import React, { useState } from 'react';
import { Dimensions, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '../components/Button';
import { Colors } from '../constants/Colors';

const { width } = Dimensions.get('window');

const PACKAGES = [
    { id: '1', name: 'Pass Hebdomadaire', price: 2500, period: '7 Jours', desc: 'Accès illimité toutes zones' },
    { id: '2', name: 'Pass Mensuel Liberté', price: 8500, period: '30 Jours', desc: 'Le meilleur rapport qualité/prix' },
    { id: '3', name: 'Pass Étudiant', price: 4000, period: '30 Jours', desc: 'Condition : Moins de 25 ans' },
];

const PAYMENT_METHODS = [
    { id: 'om', name: 'Orange Money', color: '#FF7900', icon: Smartphone, bg: '#FFF7ED' },
    { id: 'wave', name: 'Wave', color: '#1BA1E2', icon: Wallet, bg: '#F0F9FF' },
    { id: 'card', name: 'Carte Bancaire', color: '#0F56B3', icon: CreditCard, bg: '#F1F5F9' },
];

export default function RenewSubscriptionScreen() {
    const router = useRouter();
    const { type } = useLocalSearchParams();

    const [selectedPkg, setSelectedPkg] = useState('2');
    const [selectedPayment, setSelectedPayment] = useState('om');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handlePay = () => {
        setLoading(true);
        // Simulation du paiement
        setTimeout(() => {
            setLoading(false);
            setSuccess(true);
        }, 2000);
    };

    if (success) {
        return (
            <SafeAreaView style={styles.successContainer}>
                <StatusBar barStyle="light-content" />
                <View style={styles.successCard}>
                    <View style={styles.successIconCircle}>
                        <CheckCircle2 size={50} color="#22C55E" />
                    </View>
                    <Text style={styles.successTitle}>Paiement Confirmé !</Text>
                    <Text style={styles.successDesc}>Votre abonnement a été activé. Vous pouvez maintenant voyager librement.</Text>
                    <Button
                        title="RETOUR AU TRANSPORT"
                        onPress={() => router.back()}
                        style={styles.backBtnSuccess}
                    />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            {/* Header Chic */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <ChevronLeft size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Renouvellement</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <Text style={styles.sectionLabel}>SÉLECTIONNER UN FORFAIT</Text>

                {PACKAGES.map(pkg => (
                    <TouchableOpacity
                        key={pkg.id}
                        style={[styles.pkgCard, selectedPkg === pkg.id && styles.pkgCardSelected]}
                        onPress={() => setSelectedPkg(pkg.id)}
                        activeOpacity={0.8}
                    >
                        <View style={styles.pkgInfo}>
                            <Text style={[styles.pkgName, selectedPkg === pkg.id && styles.whiteText]}>{pkg.name}</Text>
                            <Text style={[styles.pkgDesc, selectedPkg === pkg.id && styles.lightText]}>{pkg.period} • {pkg.desc}</Text>
                        </View>
                        <View style={styles.pkgAction}>
                            <Text style={[styles.pkgPrice, selectedPkg === pkg.id && styles.whiteText]}>{pkg.price.toLocaleString()} F</Text>
                            {selectedPkg === pkg.id && (
                                <View style={styles.checkIconBox}>
                                    <Check size={14} color={Colors.primary} />
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                ))}

                <Text style={[styles.sectionLabel, { marginTop: 30 }]}>MODE DE PAIEMENT</Text>

                <View style={styles.paymentGrid}>
                    {PAYMENT_METHODS.map(method => (
                        <TouchableOpacity
                            key={method.id}
                            style={[
                                styles.paymentMethodCard,
                                selectedPayment === method.id && { borderColor: method.color, backgroundColor: method.bg }
                            ]}
                            onPress={() => setSelectedPayment(method.id)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.methodIconBox, { backgroundColor: method.color }]}>
                                <method.icon size={20} color={Colors.white} />
                            </View>
                            <Text style={[styles.methodName, selectedPayment === method.id && { color: method.color }]}>
                                {method.name}
                            </Text>
                            {selectedPayment === method.id && (
                                <View style={[styles.dotSelected, { backgroundColor: method.color }]} />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* FOOTER RÉSUMÉ */}
                <View style={styles.footer}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Total à payer</Text>
                        <Text style={styles.summaryValue}>
                            {PACKAGES.find(p => p.id === selectedPkg)?.price.toLocaleString()} F CFA
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.payBtn, { opacity: loading ? 0.7 : 1 }]}
                        onPress={handlePay}
                        disabled={loading}
                    >
                        <LinearGradient
                            colors={[Colors.primary, '#1E40AF']}
                            style={styles.payBtnGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.payBtnLabel}>
                                {loading ? 'TRAITEMENT EN COURS...' : 'CONFIRMER LE PAIEMENT'}
                            </Text>
                        </LinearGradient>
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: Colors.white,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: Colors.text,
    },
    scrollContent: {
        padding: 24,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '800',
        color: Colors.textSecondary,
        marginBottom: 16,
        letterSpacing: 1,
    },
    pkgCard: {
        backgroundColor: Colors.white,
        borderRadius: 24,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    pkgCardSelected: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
        elevation: 4,
    },
    pkgInfo: {
        flex: 1,
    },
    pkgName: {
        fontSize: 16,
        fontWeight: '800',
        color: Colors.text,
    },
    pkgDesc: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    pkgAction: {
        alignItems: 'flex-end',
    },
    pkgPrice: {
        fontSize: 18,
        fontWeight: '900',
        color: Colors.primary,
        marginBottom: 6,
    },
    checkIconBox: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    whiteText: {
        color: Colors.white,
    },
    lightText: {
        color: 'rgba(255,255,255,0.7)',
    },
    paymentGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    paymentMethodCard: {
        width: (width - 60) / 2,
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 16,
        borderWidth: 2,
        borderColor: 'transparent',
        marginBottom: 12,
        alignItems: 'center',
    },
    methodIconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    methodName: {
        fontSize: 13,
        fontWeight: '800',
        color: Colors.text,
        textAlign: 'center',
    },
    dotSelected: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginTop: 8,
    },
    footer: {
        marginTop: 40,
        paddingBottom: 40,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 4,
    },
    summaryLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.textSecondary,
    },
    summaryValue: {
        fontSize: 22,
        fontWeight: '900',
        color: Colors.text,
    },
    payBtn: {
        height: 60,
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 6,
    },
    payBtnGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    payBtnLabel: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    successContainer: {
        flex: 1,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
    },
    successCard: {
        backgroundColor: Colors.white,
        borderRadius: 32,
        padding: 40,
        alignItems: 'center',
        width: '100%',
    },
    successIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F0FDF4',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: Colors.text,
        textAlign: 'center',
    },
    successDesc: {
        fontSize: 15,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginTop: 12,
        lineHeight: 22,
    },
    backBtnSuccess: {
        marginTop: 32,
        width: '100%',
    }
});
