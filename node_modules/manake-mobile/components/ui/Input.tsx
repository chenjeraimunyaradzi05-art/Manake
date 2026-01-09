import React, { useState, forwardRef } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { theme } from '../../constants';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: keyof typeof FontAwesome.glyphMap;
  rightIcon?: keyof typeof FontAwesome.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  required?: boolean;
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      onRightIconPress,
      containerStyle,
      required = false,
      secureTextEntry,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const isPassword = secureTextEntry !== undefined;
    const showPassword = isPassword && isPasswordVisible;

    const getBorderColor = () => {
      if (error) return theme.colors.danger;
      if (isFocused) return theme.colors.primary;
      return theme.colors.border;
    };

    return (
      <View style={[styles.container, containerStyle]}>
        {label && (
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        )}
        
        <View
          style={[
            styles.inputContainer,
            { borderColor: getBorderColor() },
            isFocused ? styles.inputFocused : undefined,
            error ? styles.inputError : undefined,
          ]}
        >
          {leftIcon && (
            <FontAwesome
              name={leftIcon}
              size={18}
              color={error ? theme.colors.danger : theme.colors.textSecondary}
              style={styles.leftIcon}
            />
          )}
          
          <TextInput
            ref={ref}
            style={[
              styles.input,
              leftIcon && styles.inputWithLeftIcon,
              (rightIcon || isPassword) && styles.inputWithRightIcon,
            ]}
            placeholderTextColor={theme.colors.textSecondary}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            secureTextEntry={isPassword && !showPassword}
            {...props}
          />
          
          {isPassword && (
            <TouchableOpacity
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              style={styles.rightIconButton}
            >
              <FontAwesome
                name={showPassword ? 'eye-slash' : 'eye'}
                size={18}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          )}
          
          {!isPassword && rightIcon && (
            <TouchableOpacity
              onPress={onRightIconPress}
              style={styles.rightIconButton}
              disabled={!onRightIconPress}
            >
              <FontAwesome
                name={rightIcon}
                size={18}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>
        
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
        
        {hint && !error && (
          <Text style={styles.hintText}>{hint}</Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.m,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  required: {
    color: theme.colors.danger,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
  },
  inputFocused: {
    borderWidth: 2,
  },
  inputError: {
    borderColor: theme.colors.danger,
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: theme.spacing.m,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  inputWithLeftIcon: {
    paddingLeft: theme.spacing.xs,
  },
  inputWithRightIcon: {
    paddingRight: theme.spacing.xs,
  },
  leftIcon: {
    marginLeft: theme.spacing.m,
  },
  rightIconButton: {
    padding: theme.spacing.m,
  },
  errorText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.danger,
    marginTop: theme.spacing.xs,
  },
  hintText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
});
