import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { theme } from '../../constants';
import { Button, Card } from '../../components';
import { donationsApi, mockData } from '../../services/api';
import { useAuth } from '../../hooks';
import * as WebBrowser from 'expo-web-browser';

const PRESET_AMOUNTS = [10, 25, 50, 100, 250, 500];

const PAYMENT_METHODS = [
  { 
    id: 'card', 
    name: 'Credit/Debit Card', 
    icon: 'credit-card' as const,
    description: 'Visa, Mastercard, American Express',
  },
  { 
    id: 'ecocash', 
    name: 'EcoCash', 
    icon: 'mobile' as const,
    description: 'Pay with EcoCash mobile money',
  },
  { 
    id: 'bank', 
    name: 'Bank Transfer', 
    icon: 'bank' as const,
    description: 'Direct bank transfer',
  },
];

const IMPACT_ITEMS = [
  { amount: 25, impact: 'Provides one day of meals for a resident' },
  { amount: 50, impact: 'Covers one counseling session' },
  { amount: 100, impact: 'Funds a week of skills training' },
  { amount: 250, impact: 'Sponsors a family therapy session' },
  { amount: 500, impact: 'Covers one month of rehabilitation' },
];

export default function DonateScreen() {
  const { user } = useAuth();
  const [amount, setAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isCustom, setIsCustom] = useState(false);
  const [selectedPurpose, setSelectedPurpose] = useState(mockData.donationPurposes[0]);
  const [selectedPayment, setSelectedPayment] = useState<string>('card');
  const [isRecurring, setIsRecurring] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAmountSelect = (value: number) => {
    setAmount(value);
    setIsCustom(false);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    setCustomAmount(numericValue);
    if (numericValue) {
      setAmount(parseInt(numericValue, 10));
      setIsCustom(true);
    }
  };

  const handleDonate = async () => {
    if (amount < 1) {
      Alert.alert('Invalid Amount', 'Please enter a valid donation amount.');
      return;
    }

    if (!user?.email) {
      Alert.alert('Sign in required', 'Please log in to donate.');
      return;
    }

    setIsProcessing(true);

    try {
      const resp = await donationsApi.create({
        amount,
        currency: 'usd',
        paymentMethod: selectedPayment as 'card' | 'ecocash' | 'bank',
        purpose: selectedPurpose,
        donorEmail: user.email,
        donorName: user.name,
        recurring: isRecurring,
      });

      if (!resp.success) {
        Alert.alert('Donation failed', resp.message || 'Please try again.');
        return;
      }

      if (resp.data.checkoutUrl) {
        await WebBrowser.openBrowserAsync(resp.data.checkoutUrl);
        Alert.alert('Almost there', 'Complete your donation in the browser to finish.');
        return;
      }

      if (resp.data.instructions) {
        Alert.alert('Payment instructions', resp.data.instructions);
        return;
      }

      Alert.alert('Thank you', `Reference: ${resp.data.reference}`);
    } catch (error) {
      Alert.alert('Donation failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getImpactMessage = () => {
    const impact = IMPACT_ITEMS.find(item => amount >= item.amount);
    return impact ? impact.impact : 'Every dollar helps someone on their recovery journey.';
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Make a Difference</Text>
            <Text style={styles.headerSubtitle}>
              Your generosity transforms lives and builds hope
            </Text>
          </View>
          <View style={styles.heartContainer}>
            <FontAwesome name="heart" size={32} color="#fff" />
          </View>
        </View>

        {/* Impact Card */}
        <Card variant="elevated" style={styles.impactCard}>
          <View style={styles.impactContent}>
            <FontAwesome name="lightbulb-o" size={24} color={theme.colors.secondary} />
            <View style={styles.impactText}>
              <Text style={styles.impactLabel}>Your ${amount} Impact</Text>
              <Text style={styles.impactDescription}>{getImpactMessage()}</Text>
            </View>
          </View>
        </Card>

        {/* Amount Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Amount</Text>
          <View style={styles.amountGrid}>
            {PRESET_AMOUNTS.map((value) => (
              <TouchableOpacity
                key={value}
                style={[
                  styles.amountButton,
                  amount === value && !isCustom && styles.amountButtonActive,
                ]}
                onPress={() => handleAmountSelect(value)}
              >
                <Text style={[
                  styles.amountText,
                  amount === value && !isCustom && styles.amountTextActive,
                ]}>
                  ${value}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom Amount */}
          <View style={styles.customAmountContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={[styles.customAmountInput, isCustom && styles.customAmountInputActive]}
              placeholder="Other amount"
              placeholderTextColor={theme.colors.textLight}
              keyboardType="numeric"
              value={customAmount}
              onChangeText={handleCustomAmountChange}
              onFocus={() => setIsCustom(true)}
            />
          </View>
        </View>

        {/* Recurring Donation */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.recurringOption}
            onPress={() => setIsRecurring(!isRecurring)}
          >
            <View style={styles.recurringLeft}>
              <View style={[styles.checkbox, isRecurring && styles.checkboxActive]}>
                {isRecurring && <FontAwesome name="check" size={12} color="#fff" />}
              </View>
              <View>
                <Text style={styles.recurringTitle}>Make it monthly</Text>
                <Text style={styles.recurringSubtitle}>
                  Become a sustaining supporter
                </Text>
              </View>
            </View>
            <View style={styles.recurringBadge}>
              <Text style={styles.recurringBadgeText}>Recommended</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Donation Purpose */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Donation Purpose</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.purposeScroll}
          >
            {mockData.donationPurposes.map((purpose) => (
              <TouchableOpacity
                key={purpose}
                style={[
                  styles.purposeChip,
                  selectedPurpose === purpose && styles.purposeChipActive,
                ]}
                onPress={() => setSelectedPurpose(purpose)}
              >
                <Text style={[
                  styles.purposeText,
                  selectedPurpose === purpose && styles.purposeTextActive,
                ]}>
                  {purpose}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          {PAYMENT_METHODS.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentOption,
                selectedPayment === method.id && styles.paymentOptionActive,
              ]}
              onPress={() => setSelectedPayment(method.id)}
            >
              <View style={styles.paymentLeft}>
                <View style={[
                  styles.paymentIcon,
                  selectedPayment === method.id && styles.paymentIconActive,
                ]}>
                  <FontAwesome 
                    name={method.icon} 
                    size={20} 
                    color={selectedPayment === method.id ? '#fff' : theme.colors.primary} 
                  />
                </View>
                <View>
                  <Text style={styles.paymentName}>{method.name}</Text>
                  <Text style={styles.paymentDescription}>{method.description}</Text>
                </View>
              </View>
              <View style={[
                styles.radioButton,
                selectedPayment === method.id && styles.radioButtonActive,
              ]}>
                {selectedPayment === method.id && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Security Notice */}
        <View style={styles.securityNotice}>
          <FontAwesome name="lock" size={14} color={theme.colors.textLight} />
          <Text style={styles.securityText}>
            Your payment information is secure and encrypted
          </Text>
        </View>

        {/* Donate Button */}
        <View style={styles.buttonContainer}>
          <Button
            title={isProcessing ? 'Processing...' : `Donate $${amount}${isRecurring ? '/month' : ''}`}
            onPress={handleDonate}
            variant="primary"
            size="large"
            fullWidth
            loading={isProcessing}
            icon={isProcessing ? undefined : 'heart'}
          />
        </View>

        {/* Trust Badges */}
        <View style={styles.trustSection}>
          <View style={styles.trustBadge}>
            <FontAwesome name="shield" size={20} color={theme.colors.primary} />
            <Text style={styles.trustText}>100% Secure</Text>
          </View>
          <View style={styles.trustBadge}>
            <FontAwesome name="file-text-o" size={20} color={theme.colors.primary} />
            <Text style={styles.trustText}>Tax Deductible</Text>
          </View>
          <View style={styles.trustBadge}>
            <FontAwesome name="heart-o" size={20} color={theme.colors.primary} />
            <Text style={styles.trustText}>90% to Programs</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Manake Rehabilitation Center is a registered non-profit organization.
            All donations are tax-deductible.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  // Header
  header: {
    backgroundColor: theme.colors.primary,
    padding: 24,
    paddingTop: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
  },
  heartContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Impact Card
  impactCard: {
    marginHorizontal: 20,
    marginTop: -20,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.secondary,
  },
  impactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  impactText: {
    flex: 1,
  },
  impactLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  impactDescription: {
    fontSize: 13,
    color: theme.colors.textLight,
    lineHeight: 18,
  },
  // Section
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 14,
  },
  // Amount Grid
  amountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  amountButton: {
    width: '31%',
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  amountButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  amountText: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  amountTextActive: {
    color: '#fff',
  },
  // Custom Amount
  customAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    marginTop: 12,
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginRight: 8,
  },
  customAmountInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  customAmountInputActive: {
    borderColor: theme.colors.primary,
  },
  // Recurring
  recurringOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  recurringLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  recurringTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  recurringSubtitle: {
    fontSize: 12,
    color: theme.colors.textLight,
  },
  recurringBadge: {
    backgroundColor: `${theme.colors.secondary}20`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recurringBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.secondary,
  },
  // Purpose
  purposeScroll: {
    gap: 8,
  },
  purposeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 8,
  },
  purposeChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  purposeText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.text,
  },
  purposeTextActive: {
    color: '#fff',
  },
  // Payment Methods
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  paymentOptionActive: {
    borderColor: theme.colors.primary,
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: `${theme.colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentIconActive: {
    backgroundColor: theme.colors.primary,
  },
  paymentName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  paymentDescription: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginTop: 2,
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonActive: {
    borderColor: theme.colors.primary,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
  },
  // Security Notice
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20,
  },
  securityText: {
    fontSize: 12,
    color: theme.colors.textLight,
  },
  // Button
  buttonContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  // Trust Badges
  trustSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginTop: 24,
  },
  trustBadge: {
    alignItems: 'center',
    gap: 6,
  },
  trustText: {
    fontSize: 11,
    color: theme.colors.textLight,
    fontWeight: '500',
  },
  // Footer
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: theme.colors.textLight,
    textAlign: 'center',
    lineHeight: 18,
  },
});
