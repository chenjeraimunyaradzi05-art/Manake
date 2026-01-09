import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { theme } from '../../constants';

interface SettingItemProps {
  icon: keyof typeof FontAwesome.glyphMap;
  label: string;
  value?: string | boolean;
  type: 'toggle' | 'link' | 'info';
  onPress?: () => void;
  onChange?: (value: boolean) => void;
  danger?: boolean;
}

export function SettingItem({
  icon,
  label,
  value,
  type,
  onPress,
  onChange,
  danger = false,
}: SettingItemProps) {
  const iconColor = danger ? theme.colors.danger : theme.colors.primary;
  const textColor = danger ? theme.colors.danger : theme.colors.text;

  const content = (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
          <FontAwesome name={icon} size={18} color={iconColor} />
        </View>
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      </View>
      <View style={styles.right}>
        {type === 'toggle' && typeof value === 'boolean' && (
          <Switch
            value={value}
            onValueChange={onChange}
            trackColor={{ false: '#d1d5db', true: `${theme.colors.primary}60` }}
            thumbColor={value ? theme.colors.primary : '#f4f3f4'}
          />
        )}
        {type === 'link' && (
          <View style={styles.linkContent}>
            {typeof value === 'string' && (
              <Text style={styles.valueText}>{value}</Text>
            )}
            <FontAwesome name="chevron-right" size={14} color={theme.colors.textLight} />
          </View>
        )}
        {type === 'info' && typeof value === 'string' && (
          <Text style={styles.infoText}>{value}</Text>
        )}
      </View>
    </View>
  );

  if (type === 'link' && onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  valueText: {
    fontSize: 14,
    color: theme.colors.textLight,
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.textLight,
  },
});

export default SettingItem;
