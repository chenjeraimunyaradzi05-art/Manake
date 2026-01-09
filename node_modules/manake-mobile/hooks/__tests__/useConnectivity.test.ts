// Mock @react-native-community/netinfo before imports
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(() =>
    Promise.resolve({
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
    })
  ),
  addEventListener: jest.fn(() => jest.fn()),
}));

import NetInfo from '@react-native-community/netinfo';

describe('useConnectivity hook dependencies', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('NetInfo.fetch should be callable', async () => {
    const result = await NetInfo.fetch();
    expect(result.isConnected).toBe(true);
    expect(result.isInternetReachable).toBe(true);
    expect(result.type).toBe('wifi');
  });

  it('NetInfo.addEventListener should be callable', () => {
    const unsubscribe = NetInfo.addEventListener(jest.fn());
    expect(NetInfo.addEventListener).toHaveBeenCalled();
    expect(typeof unsubscribe).toBe('function');
  });

  it('should call unsubscribe function correctly', () => {
    const mockUnsubscribe = jest.fn();
    (NetInfo.addEventListener as jest.Mock).mockReturnValue(mockUnsubscribe);
    
    const unsubscribe = NetInfo.addEventListener(jest.fn());
    unsubscribe();
    
    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
