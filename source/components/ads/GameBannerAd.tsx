import React from 'react';
import {StyleSheet, View} from 'react-native';
import {BannerAd, BannerAdSize, TestIds} from 'react-native-google-mobile-ads';
import {colors} from '~/utils/colors';

const GameBannerAd = () => {
  const adUnitId = __DEV__
    ? TestIds.BANNER
    : 'ca-app-pub-3655197897637289/9135063146';

  return (
    <View style={styles.banner}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
          customTargeting: {
            content_rating: 'general_audience',
            app_category: 'family_games',
          },
          keywords: ['games', 'puzzle', 'word', 'family friendly', 'education'],
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 50,
    backgroundColor: colors.mainColors.d,
  },
});

export default GameBannerAd;
