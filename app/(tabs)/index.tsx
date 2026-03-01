import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Bell, Bus, Info, LayoutGrid, Plus, Route, Search, Train, Wallet, Zap } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, Image, NativeScrollEvent, NativeSyntheticEvent, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { TransportCard } from '../../components/TransportCard';
import { Colors } from '../../constants/Colors';
import { UserService } from '../../services/api';

const { width } = Dimensions.get('window');
const SLIDER_WIDTH = width - 48;

const ADVERTISEMENTS = [
  {
    id: '1',
    image: require('../../assets/promo.png'),
    title: 'TER : Un voyage serein',
    description: 'Confort premium première classe.',
    badge: 'Expérience TER'
  },
  {
    id: '2',
    image: require('../../assets/promo_brt.png'),
    title: 'BRT : Rapidité absolue',
    description: 'Gagnez du temps sur vos trajets.',
    badge: 'Vitesse BRT'
  },
  {
    id: '3',
    image: require('../../assets/promo_bus.png'),
    title: 'Bus : Partout avec vous',
    description: 'Le plus grand réseau urbain.',
    badge: 'Accessibilité Bus'
  }
];

export default function HomeScreen() {
  const router = useRouter();
  const [user, setUser] = useState({ name: 'Modou Sarr', balance: 15450, trips: 189 });
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await UserService.getProfile('user_id_123');
        if (data) setUser(data);
      } catch (err) {
        console.error("Home: fetch user failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      let nextSlide = (activeSlide + 1) % ADVERTISEMENTS.length;
      setActiveSlide(nextSlide);
      flatListRef.current?.scrollToIndex({ index: nextSlide, animated: true });
    }, 5000);

    return () => clearInterval(timer);
  }, [activeSlide]);

  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);
    setActiveSlide(roundIndex);
  };

  const renderPromoItem = ({ item }: { item: typeof ADVERTISEMENTS[0] }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[styles.promoCard, { width: SLIDER_WIDTH }]}
    >
      <Image source={item.image} style={styles.promoImage} resizeMode="cover" />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.85)']}
        style={styles.promoOverlay}
      >
        <View style={styles.promoBadge}>
          <Info size={12} color={Colors.white} />
          <Text style={styles.badgeText}>{item.badge}</Text>
        </View>
        <Text style={styles.promoTitle}>{item.title}</Text>
        <Text style={styles.promoDesc}>{item.description}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} bounces={true}>

        {/* Header Smart Mobility */}
        <View style={styles.header}>
          <View style={styles.topRow}>
            <View style={styles.logoAndTitle}>
              <View style={styles.logoCircle}>
                <Image source={require('../../assets/logo.png')} style={styles.logoImage} resizeMode="contain" />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.logoText}>Smart</Text>
                <Text style={styles.logoTextBold}>Mobility</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.notifBtn} onPress={() => router.push('/notifications')}>
              <Bell size={22} color={Colors.white} />
              <View style={styles.notifDot} />
            </TouchableOpacity>
          </View>

          {/* Salutation & Recherche */}
          <View style={styles.greetingContainer}>
            <Text style={styles.welcomeText}>Bonjour, {loading ? '...' : user.name.split(' ')[0]}</Text>
            <Text style={styles.whereToText}>Où allons-nous aujourd'hui ?</Text>
          </View>

          <View style={styles.searchContainer}>
            <Search size={18} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher une destination..."
              placeholderTextColor={Colors.textSecondary}
            />
          </View>
        </View>

        {/* Portefeuille & Voyages MIS EN AVANT */}
        <View style={styles.statsWrapper}>
          <View style={styles.mainStatsCard}>
            <View style={styles.balanceInfo}>
              <View style={styles.statIconBox}>
                <Wallet size={20} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.statLabelMain}>Votre Solde</Text>
                <Text style={[styles.statValueMain, styles.balanceValue]}>{loading ? '...' : user.balance.toLocaleString('fr-FR')} F</Text>
              </View>
            </View>

            <View style={styles.mainDivider} />

            <View style={styles.tripInfo}>
              <View style={styles.statIconBoxLight}>
                <Route size={20} color="#FF9933" />
              </View>
              <View>
                <Text style={styles.statLabelMain}>Trajets</Text>
                <Text style={styles.statValueMain}>{loading ? '...' : user.trips}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.topUpBtn} onPress={() => router.push('/renew')}>
              <Plus size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.carouselContainer}>
            <FlatList
              ref={flatListRef}
              data={ADVERTISEMENTS}
              renderItem={renderPromoItem}
              keyExtractor={(item) => item.id}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={onMomentumScrollEnd}
              snapToAlignment="center"
              decelerationRate="fast"
            />
            <View style={styles.pagination}>
              {ADVERTISEMENTS.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    { backgroundColor: activeSlide === index ? Colors.primary : 'rgba(255,255,255,0.3)' },
                    activeSlide === index && styles.activeDot
                  ]}
                />
              ))}
            </View>
          </View>

          <View style={styles.selectionTitleContainer}>
            <Text style={styles.sectionTitle}>Types de transport</Text>
            <LayoutGrid size={18} color={Colors.primary} />
          </View>

          <TransportCard
            title="Sénégal Dem Dikk"
            description="Toutes les lignes urbaines"
            icon={Bus}
            onPress={() => router.push({ pathname: '/voyage_control', params: { type: 'bus' } })}
            color="#47A0C7"
          />

          <TransportCard
            title="BRT Rapide"
            description="Le moyen le plus efficace"
            icon={Zap}
            onPress={() => router.push({ pathname: '/voyage_control', params: { type: 'brt' } })}
            color="#FF5733"
          />

          <TransportCard
            title="TER Express"
            description="Dakar - Diamniadio • 45 min"
            icon={Train}
            onPress={() => router.push({ pathname: '/voyage_control', params: { type: 'ter' } })}
            color="#0F56B3"
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
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingTop: 45,
    paddingBottom: 60,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoAndTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.white,
    padding: 6,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  logoText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '400',
    marginBottom: -4,
  },
  logoTextBold: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.white,
  },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  greetingContainer: {
    marginBottom: 24,
  },
  welcomeText: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  whereToText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  searchContainer: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    elevation: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text,
  },
  statsWrapper: {
    marginTop: -35,
    paddingHorizontal: 24,
  },
  mainStatsCard: {
    backgroundColor: Colors.white,
    borderRadius: 28,
    paddingVertical: 20,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
  },
  balanceInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tripInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  statIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  statIconBoxLight: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  statLabelMain: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  statValueMain: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.text,
  },
  balanceValue: {
    color: Colors.primary,
  },
  mainDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 8,
  },
  topUpBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40,
  },
  carouselContainer: {
    marginVertical: 16,
    borderRadius: 24,
    overflow: 'hidden',
    height: 140,
  },
  promoCard: {
    height: 140,
    backgroundColor: '#000',
  },
  promoImage: {
    width: '100%',
    height: '100%',
    opacity: 0.75,
  },
  promoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    justifyContent: 'flex-end',
  },
  promoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: '800',
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  promoTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  promoDesc: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '500',
  },
  pagination: {
    position: 'absolute',
    bottom: 12,
    right: 16,
    flexDirection: 'row',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 6,
  },
  activeDot: {
    width: 12,
  },
  selectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.text,
  }
});