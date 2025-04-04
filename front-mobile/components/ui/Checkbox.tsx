import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from './Text';
import { NAVIGATION_THEME } from '../../navigation/constants';
import { Ionicons } from '@expo/vector-icons';
import { scale } from '../../utils/responsive';

interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({ 
  checked, 
  onCheckedChange, 
  label, 
  disabled = false 
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => !disabled && onCheckedChange(!checked)}
      style={[
        styles.container,
        disabled && styles.disabled
      ]}
      disabled={disabled}
    >
      <View style={[
        styles.checkbox,
        checked && styles.checked,
        disabled && styles.disabledBox
      ]}>
        {checked && (
          <Ionicons
            name="checkmark"
            size={16}
            color={NAVIGATION_THEME.colors.surface}
          />
        )}
      </View>
      
      {label && (
        <Text
          variant="body2"
          style={[
            styles.label,
            disabled && styles.disabledText
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: NAVIGATION_THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(8),
  },
  checked: {
    backgroundColor: NAVIGATION_THEME.colors.primary,
  },
  label: {
    color: NAVIGATION_THEME.colors.onSurface,
  },
  disabled: {
    opacity: 0.6,
  },
  disabledBox: {
    borderColor: NAVIGATION_THEME.colors.onSurfaceVariant,
  },
  disabledText: {
    color: NAVIGATION_THEME.colors.onSurfaceVariant,
  }
}); 