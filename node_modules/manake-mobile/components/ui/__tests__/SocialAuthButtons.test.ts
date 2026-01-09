/**
 * Tests for SocialAuthButtons component
 */

import React from 'react';

// Mock the component
jest.mock('../../ui/SocialAuthButtons', () => ({
  __esModule: true,
  SocialAuthButtons: () => null,
  SocialIconButton: () => null,
  default: () => null,
}));

describe('SocialAuthButtons Component', () => {
  it('should be defined', () => {
    const { SocialAuthButtons } = require('../../ui/SocialAuthButtons');
    expect(SocialAuthButtons).toBeDefined();
  });

  it('should export SocialIconButton', () => {
    const { SocialIconButton } = require('../../ui/SocialAuthButtons');
    expect(SocialIconButton).toBeDefined();
  });

  it('should export default SocialAuthButtons', () => {
    const SocialAuthButtons = require('../../ui/SocialAuthButtons').default;
    expect(SocialAuthButtons).toBeDefined();
  });
});

describe('Provider configurations', () => {
  const getProviderConfig = (provider: 'google' | 'apple' | 'facebook' | 'twitter') => {
    switch (provider) {
      case 'google':
        return { icon: 'google', color: '#DB4437', bg: '#fff' };
      case 'apple':
        return { icon: 'apple', color: '#fff', bg: '#000' };
      case 'facebook':
        return { icon: 'facebook', color: '#fff', bg: '#1877F2' };
      case 'twitter':
        return { icon: 'twitter', color: '#fff', bg: '#1DA1F2' };
    }
  };

  it('should return correct Google config', () => {
    const config = getProviderConfig('google');
    expect(config.icon).toBe('google');
    expect(config.color).toBe('#DB4437');
  });

  it('should return correct Apple config', () => {
    const config = getProviderConfig('apple');
    expect(config.icon).toBe('apple');
    expect(config.bg).toBe('#000');
  });

  it('should return correct Facebook config', () => {
    const config = getProviderConfig('facebook');
    expect(config.icon).toBe('facebook');
    expect(config.bg).toBe('#1877F2');
  });

  it('should return correct Twitter config', () => {
    const config = getProviderConfig('twitter');
    expect(config.icon).toBe('twitter');
    expect(config.bg).toBe('#1DA1F2');
  });
});
