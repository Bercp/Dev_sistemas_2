import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'react-native';
import RootNavigation from './navigation';

export default function App() {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <RootNavigation />
    </>
  );
}
