import React from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';

const LoadingFallback = () => (
  <View style={styles.loading}>
    <Text style={styles.loadingText}>{'טוען..'}</Text>
    <ActivityIndicator size="large" color="#ffffff80" />
  </View>
);

export default LoadingFallback;

const styles = StyleSheet.create({
  loading: {
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{scale: 1.5}],
    gap: 10,
    borderRadius: 20,
    backgroundColor: '#00000025',
    width: 120,
    height: 110,
  },
  loadingText: {
    color: '#fffffff0',
    fontFamily: 'PloniDL1.1AAA-Bold',
    fontSize: 16,
  },
});
