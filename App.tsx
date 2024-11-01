import React, {useEffect} from 'react';
import {SafeAreaView, StatusBar} from 'react-native';
import mobileAds from 'react-native-google-mobile-ads';
import GameScreen from './source/screens/WordleGame';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from '~/screens/Home';
import {RootStackParamList} from '~/navigation/types';
import NewGameScreen from '~/screens/NewGame';
import GameBannerAd from '~/components/ads/GameBannerAd';
import {I18nManager} from 'react-native';
import UserInfoScreen from '~/screens/UserInfo';

const Stack = createNativeStackNavigator<RootStackParamList>();

mobileAds()
  .initialize()
  .then(_ => {});

const App = () => {
  const backgroundStyle = {
    backgroundColor: '#343D4E',
  };
  I18nManager.allowRTL(false);

  return (
    <>
      <SafeAreaView style={backgroundStyle} />
      <StatusBar backgroundColor={'#343D4E'} />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
            contentStyle: backgroundStyle,
            animation: 'fade',
            gestureDirection: 'horizontal',
          }}>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              animation: 'slide_from_left',
            }}
          />
          <Stack.Screen
            name="NewGame"
            component={NewGameScreen}
            options={{
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="WordGame"
            component={GameScreen}
            options={{
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="UserInfo"
            component={UserInfoScreen}
            options={{
              animation: 'slide_from_right',
            }}
          />
        </Stack.Navigator>
        <GameBannerAd />
      </NavigationContainer>
    </>
  );
};

export default App;
