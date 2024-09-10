import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  // StyleSheet,
  useColorScheme,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import mobileAds from 'react-native-google-mobile-ads';
import WordGame from './source/screens/WordleGame';

mobileAds()
  .initialize()
  .then(_ => {
    // Initialization complete
    console.log('Mobile Ads SDK initialized');
  });

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <WordGame />
    </SafeAreaView>
  );
};

export default App;
