import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EventsListScreen from '../screens/ListaDeEventos';
import EventScreen from '../screens/Evento';
import AttendeesScreen from '../screens/Listaparticipantes';

export type RootStackParamList = {
  Events: undefined;
  Event: { eventId: string };
  Attendees: { eventId: string; onCheckedIn?: () => void } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Events">
        <Stack.Screen name="Events" options={{ title: 'Eventos' }}>
          {() => <EventsListScreen />}
        </Stack.Screen>
        <Stack.Screen name="Event" component={EventScreen} options={{ title: 'Evento' }} />
        <Stack.Screen name="Attendees" component={AttendeesScreen} options={{ title: 'Participantes' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
