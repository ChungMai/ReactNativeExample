import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ListScreen from './screens/ListScreen';
import CommentsScreen from './screens/CommentsScreen';
import DetailScreen from './screens/DetailScreen';

export type RootStackParamList = {
  List: undefined;
  Detail: { id: string };
  Comments: { photoId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default class Navigation extends React.Component {
  override render() {
    return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="List" component={ListScreen} options={{ title: 'Photos' }} />
          <Stack.Screen name="Detail" component={DetailScreen} options={{ title: 'Detail' }} />
          <Stack.Screen name="Comments" component={CommentsScreen} options={{ title: 'Comments' }} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}
