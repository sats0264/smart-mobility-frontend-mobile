import { Clock, MapPin, Train } from 'lucide-react-native';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';

const HORAIRES = [
  { id: '1', heure: '10:00 → 10:30', station: 'Gare de Dakar', prix: '1.500 F' },
  { id: '2', heure: '11:05 → 11:45', station: 'Gare de Dakar', prix: '1.500 F' },
  { id: '3', heure: '11:25 → 12:30', station: 'Diamniadio', prix: '1.000 F' },
];

export default function VoyageScreen() {
  const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* En-tête Illustration */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>TER</Text>
          <View style={styles.illustration}>
            <Train size={120} color={Colors.white} opacity={0.3} />
            <View style={styles.trainGraphic} />
          </View>
        </View>

        <View style={styles.body}>
          {/* Carte de trajet */}
          <View style={styles.journeyCard}>
            <View style={styles.routeContainer}>
              <View style={styles.routeLine}>
                <MapPin size={20} color={Colors.primary} />
                <View style={styles.dashLine} />
                <MapPin size={20} color={Colors.text} />
              </View>
              <View style={styles.routeText}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Départ</Text>
                  <Text style={styles.value}>Gare de Dakar</Text>
                  <View style={styles.divider} />
                </View>
                <View style={[styles.inputGroup, { marginTop: 24 }]}>
                  <Text style={styles.label}>Arrivée</Text>
                  <Text style={styles.value}>Diamniadio</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Section Horaires */}
          <Text style={styles.sectionTitle}>Choisir l'horaire</Text>

          {HORAIRES.map(item => (
            <View key={item.id} style={styles.scheduleItem}>
              <View style={styles.scheduleInfo}>
                <View style={styles.timeRow}>
                  <Clock size={16} color={Colors.textSecondary} />
                  <Text style={styles.scheduleTime}>{item.heure}</Text>
                </View>
                <View style={styles.stationRow}>
                  <MapPin size={16} color={Colors.textSecondary} />
                  <Text style={styles.scheduleStation}>{item.station}</Text>
                </View>
              </View>

              <View style={styles.priceRow}>
                <Text style={styles.schedulePrice}>{item.prix}</Text>
                <TouchableOpacity
                  style={[styles.selectBtn, selectedSchedule === item.id && styles.selectedBtn]}
                  onPress={() => setSelectedSchedule(item.id)}
                >
                  <Text style={[styles.selectBtnText, selectedSchedule === item.id && styles.selectedBtnText]}>
                    {selectedSchedule === item.id ? 'Sélectionné' : 'Sélectionner'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
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
    backgroundColor: Colors.primary,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 2,
    position: 'absolute',
    top: 60,
  },
  illustration: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  trainGraphic: {
    width: 280,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    marginTop: -20,
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(255,255,255,0.4)',
  },
  body: {
    padding: 24,
    marginTop: -60,
  },
  journeyCard: {
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
  routeContainer: {
    flexDirection: 'row',
  },
  routeLine: {
    alignItems: 'center',
    marginRight: 20,
    paddingTop: 4,
  },
  dashLine: {
    width: 2,
    height: 60,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  routeText: {
    flex: 1,
  },
  inputGroup: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 20,
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  scheduleInfo: {
    flex: 1,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  scheduleTime: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginLeft: 8,
  },
  stationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleStation: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  priceRow: {
    alignItems: 'flex-end',
  },
  schedulePrice: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  selectBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: Colors.secondary,
  },
  selectedBtn: {
    backgroundColor: Colors.primary,
  },
  selectBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
  },
  selectedBtnText: {
    color: Colors.white,
  }
});
