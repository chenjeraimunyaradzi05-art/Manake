import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert, Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { theme } from '../../constants';

interface EmergencyWidgetProps {
  compact?: boolean;
}

const emergencyContacts = [
  {
    id: '1',
    name: '24/7 Helpline',
    phone: '+263242123456',
    icon: 'phone' as const,
    color: theme.colors.danger,
  },
  {
    id: '2',
    name: 'WhatsApp',
    phone: '+263779876543',
    icon: 'whatsapp' as const,
    color: '#25D366',
    isWhatsApp: true,
  },
];

export function EmergencyWidget({ compact = false }: EmergencyWidgetProps) {
  const handleCall = async (phone: string, isWhatsApp?: boolean) => {
    try {
      if (isWhatsApp) {
        const whatsappUrl = `whatsapp://send?phone=${phone.replace(/\D/g, '')}`;
        const canOpen = await Linking.canOpenURL(whatsappUrl);
        if (canOpen) {
          await Linking.openURL(whatsappUrl);
        } else {
          Alert.alert('WhatsApp not installed', 'Please install WhatsApp to use this feature.');
        }
      } else {
        const phoneUrl = Platform.select({
          ios: `telprompt:${phone}`,
          android: `tel:${phone}`,
          default: `tel:${phone}`,
        });
        await Linking.openURL(phoneUrl);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not make the call. Please try again.');
    }
  };

  if (compact) {
    return (
      <TouchableOpacity 
        style={styles.compactWidget}
        onPress={() => handleCall(emergencyContacts[0].phone)}
        activeOpacity={0.7}
      >
        <View style={styles.compactIcon}>
          <FontAwesome name="phone" size={16} color="#fff" />
        </View>
        <Text style={styles.compactText}>Need Help?</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.widget}>
      <View style={styles.header}>
        <View style={styles.pulseContainer}>
          <View style={styles.pulse} />
          <FontAwesome name="heart" size={16} color={theme.colors.danger} />
        </View>
        <Text style={styles.title}>Need Immediate Help?</Text>
      </View>
      <Text style={styles.description}>
        Our crisis support team is available 24/7. You're not alone.
      </Text>
      <View style={styles.buttons}>
        {emergencyContacts.map((contact) => (
          <TouchableOpacity
            key={contact.id}
            style={[styles.button, { backgroundColor: contact.color }]}
            onPress={() => handleCall(contact.phone, contact.isWhatsApp)}
            activeOpacity={0.8}
          >
            <FontAwesome name={contact.icon} size={18} color="#fff" />
            <Text style={styles.buttonText}>{contact.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  widget: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: theme.colors.danger,
    shadowColor: theme.colors.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pulseContainer: {
    marginRight: 10,
  },
  pulse: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.danger,
    opacity: 0.3,
    left: -4,
    top: -4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  description: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginBottom: 16,
    lineHeight: 20,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Compact styles
  compactWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.danger,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    alignSelf: 'flex-start',
  },
  compactIcon: {
    marginRight: 8,
  },
  compactText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default EmergencyWidget;
