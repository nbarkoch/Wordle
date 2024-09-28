import React from 'react';
import {StatusBar} from 'react-native';
import mobileAds from 'react-native-google-mobile-ads';
import GameScreen from './source/screens/WordleGame';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from '~/screens/Home';
import {RootStackParamList} from '~/navigation/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

mobileAds()
  .initialize()
  .then(_ => {
    // Initialization complete
  });

const App = () => {
  const backgroundStyle = {
    backgroundColor: '#343D4E',
  };

  return (
    <NavigationContainer>
      <StatusBar backgroundColor={backgroundStyle.backgroundColor} />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{headerShown: false}}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="WordGame" component={GameScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
