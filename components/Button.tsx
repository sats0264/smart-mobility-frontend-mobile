import React from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
import { Colors } from '../constants/Colors';

interface ButtonProps {
    onPress: () => void;
    title: string;
    variant?: 'primary' | 'secondary' | 'outline';
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ onPress, title, variant = 'primary', style, textStyle, disabled }) => {
    const isOutline = variant === 'outline';
    const isSecondary = variant === 'secondary';

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            style={[
                styles.button,
                isOutline ? styles.outline : isSecondary ? styles.secondary : styles.primary,
                disabled && styles.disabled,
                style
            ]}
            onPress={onPress}
            disabled={disabled}
        >
            <Text style={[
                styles.text,
                isOutline ? styles.textOutline : styles.textPrimary,
                disabled && styles.disabledText,
                textStyle
            ]}>
                {title}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 0,
    },
    primary: {
        backgroundColor: Colors.primary,
    },
    secondary: {
        backgroundColor: '#E0F2F9',
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: Colors.primary,
    },
    text: {
        fontSize: 16,
        fontWeight: '700',
    },
    textPrimary: {
        color: Colors.white,
    },
    textOutline: {
        color: Colors.primary,
    },
    disabled: {
        backgroundColor: '#CBD5E1',
        elevation: 0,
    },
    disabledText: {
        color: '#64748B',
    }
});
