import { ChevronRight, LucideIcon } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';

interface TransportCardProps {
    title: string;
    icon: LucideIcon;
    description: string;
    onPress: () => void;
    color?: string;
}

export const TransportCard: React.FC<TransportCardProps> = ({ title, icon: Icon, description, onPress, color = Colors.primary }) => {
    return (
        <TouchableOpacity
            activeOpacity={0.7}
            style={styles.card}
            onPress={onPress}
        >
            <View style={[styles.glow, { backgroundColor: color }]} />
            <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
                <Icon size={22} color={color} />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.description} numberOfLines={1}>{description}</Text>
            </View>
            <View style={styles.action}>
                <View style={styles.arrowCircle}>
                    <ChevronRight size={16} color={Colors.primary} />
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.white,
        borderRadius: 22,
        padding: 14,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
    },
    glow: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
        opacity: 0.8,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '800',
        color: Colors.text,
        marginBottom: 1,
    },
    description: {
        fontSize: 12,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    action: {
        marginLeft: 10,
    },
    arrowCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
    }
});
