import React from 'react';
import { View, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Text } from './Text';
import { NAVIGATION_THEME } from '../../navigation/constants';
import { scale, verticalScale } from '../../utils/responsive';

type RadioOption = {
  label: string;
  value: string;
};

type RadioGroupProps = {
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  style?: StyleProp<ViewStyle>;
};

export const RadioGroup: React.FC<RadioGroupProps> = ({
  options,
  value,
  onChange,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.option,
            value === option.value && styles.optionSelected,
          ]}
          onPress={() => onChange(option.value)}
          activeOpacity={0.7}
        >
          <View style={[
            styles.radio,
            value === option.value && styles.radioActive
          ]}>
            {value === option.value && <View style={styles.radioSelected} />}
          </View>
          <Text variant="body" style={[
            styles.label,
            value === option.value && styles.labelSelected,
          ]}>
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(12),
    marginBottom: verticalScale(8),
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: NAVIGATION_THEME.colors.border,
    backgroundColor: NAVIGATION_THEME.colors.surface,
  },
  optionSelected: {
    borderColor: NAVIGATION_THEME.colors.primary,
    backgroundColor: `${NAVIGATION_THEME.colors.primary}10`, // 10% opacity
  },
  radio: {
    width: scale(20),
    height: scale(20),
    borderRadius: scale(10),
    borderWidth: 2,
    borderColor: NAVIGATION_THEME.colors.border,
    marginRight: scale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioActive: {
    borderColor: NAVIGATION_THEME.colors.primary,
  },
  radioSelected: {
    width: scale(10),
    height: scale(10),
    borderRadius: scale(5),
    backgroundColor: NAVIGATION_THEME.colors.primary,
  },
  label: {
    color: NAVIGATION_THEME.colors.onSurfaceVariant,
  },
  labelSelected: {
    color: NAVIGATION_THEME.colors.primary,
    fontWeight: '600',
  },
}); 