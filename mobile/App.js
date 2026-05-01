import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import WizardScreen from "./src/screens/WizardScreen";
import ResultsScreen from "./src/screens/ResultsScreen";
import DetailScreen from "./src/screens/DetailScreen";
import HistoryScreen from "./src/screens/HistoryScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const C = { primary: "#1B3A5C", accent: "#2563EB", border: "#D1D9E6", white: "#FFFFFF" };

function FinderStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Sihirbaz" component={WizardScreen} />
      <Stack.Screen name="Sonuçlar" component={ResultsScreen} />
      <Stack.Screen name="Detay" component={DetailScreen} />
    </Stack.Navigator>
  );
}

function HistoryStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: C.primary },
        headerTintColor: C.white,
        headerTitleStyle: { fontWeight: "700", letterSpacing: 0.5 },
      }}
    >
      <Stack.Screen name="Geçmiş" component={HistoryScreen} options={{ title: "Arama Geçmişi" }} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: C.accent,
          tabBarInactiveTintColor: "#94A3B8",
          tabBarStyle: {
            backgroundColor: C.white,
            borderTopColor: C.border,
            borderTopWidth: 1,
            height: 60,
            paddingBottom: 8,
          },
          tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        }}
      >
        <Tab.Screen
          name="Eldiven Bul"
          component={FinderStack}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="magnify" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Geçmiş"
          component={HistoryStack}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="history" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
