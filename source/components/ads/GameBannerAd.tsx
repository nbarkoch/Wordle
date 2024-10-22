import React from 'react';
import {View} from 'react-native';
import {BannerAd, BannerAdSize, TestIds} from 'react-native-google-mobile-ads';

const GameBannerAd = () => {
  const backgroundStyle = {
    backgroundColor: '#33556E',
  };

  const adUnitId = __DEV__
    ? TestIds.BANNER
    : 'YOUR_PRODUCTION_BANNER_AD_UNIT_ID';

  return (
    <View
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 50,
        backgroundColor: backgroundStyle.backgroundColor,
      }}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
    </View>
  );
};

export default GameBannerAd;
