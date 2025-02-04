import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/Colors';
import { forwardRef } from 'react';

type Props = {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
};

export const Button = forwardRef<TouchableOpacity, Props>(({ 
  title, 
  onPress, 
  loading, 
  variant = 'primary' 
}, ref) => {
  return (
    <TouchableOpacity 
      ref={ref}
      style={[styles.button, variant === 'secondary' && styles.buttonSecondary]} 
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text style={[
          styles.text,
          variant === 'secondary' && styles.textSecondary
        ]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.light.tint,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.light.tint,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  textSecondary: {
    color: Colors.light.tint
  }
});