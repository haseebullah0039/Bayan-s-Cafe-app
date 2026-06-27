import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Platform } from 'react-native';
import { COLORS } from '../../constants';

function TabIcon({ name, focused }: { name: any; focused: boolean }) {
  return (
    <View style={[tabStyles.iconWrap, focused && tabStyles.iconActive]}>
      <Ionicons name={name} size={22} color={focused ? COLORS.primary : '#444'} />
    </View>
  );
}

const tabStyles = StyleSheet.create({
  iconWrap: {
    width: 44, height: 32, alignItems: 'center', justifyContent: 'center',
    borderRadius: 10,
  },
  iconActive: { backgroundColor: COLORS.primary + '20' },
});

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#111',
          borderTopColor: '#1A1A1A',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 22 : 8,
          paddingTop: 6,
          ...Platform.select({
            web:     { boxShadow: '0 -4px 12px rgba(0,0,0,0.4)' },
            default: { elevation: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.4, shadowRadius: 12 },
          }) as any,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: '#444',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Menu',
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'restaurant' : 'restaurant-outline'} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="deals"
        options={{
          title: 'Deals',
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'pricetag' : 'pricetag-outline'} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'heart' : 'heart-outline'} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="tracking"
        options={{
          title: 'My Order',
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'location' : 'location-outline'} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'person' : 'person-outline'} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
