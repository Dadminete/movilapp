import React from "react";
import { ActivityIndicator, SafeAreaView, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";

import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { darkTheme, lightTheme } from "@/theme";
import { HomeScreen } from "@/screens/HomeScreen";
import { LoginScreen } from "@/screens/LoginScreen";

function AppContent() {
  const { loading, token } = useAuth();
  const { theme } = useTheme();
  const colors = theme === "dark" ? darkTheme : lightTheme;

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.bg,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 12, color: colors.textDim }}>Cargando sesión...</Text>
      </SafeAreaView>
    );
  }

  return token ? <HomeScreen /> : <LoginScreen />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
