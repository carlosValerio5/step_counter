import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { create } from "zustand";
import { GoalStore } from "./types/GoalStore";

export const useGoalStore = create<GoalStore>((set) => ({
  goal: 10000,
  setGoal: (goal) => set({ goal }),
}));

export default function Goals() {
  const router = useRouter();
  const [goal, setGoal] = useState("10000");
  const [error, setError] = useState("");

  const handleSave = () => {
    const goalNumber = parseInt(goal, 10);
    
    if (isNaN(goalNumber) || goalNumber <= 0) {
      setError("Please enter a valid number greater than 0");
      return;
    }

    if (goalNumber > 100000) {
      setError("Goal cannot exceed 100,000 steps");
      return;
    }

    // Here you would save the goal to AsyncStorage or your state management
    // For now, we'll just navigate back
    setError("");
    useGoalStore.setState({ goal: goalNumber });
    router.back();
  };

  const handleQuickSet = (value: number) => {
    setGoal(value.toString());
    setError("");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Set Daily Goal</Text>
            <Text style={styles.subtitle}>
              Enter your target number of steps for the day
            </Text>
          </View>

          {/* Input Section */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={goal}
                onChangeText={(text) => {
                  setGoal(text);
                  setError("");
                }}
                placeholder="10000"
                placeholderTextColor="#666666"
                keyboardType="number-pad"
                maxLength={6}
                selectTextOnFocus
              />
              <Text style={styles.inputLabel}>steps</Text>
            </View>

            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}

            {/* Quick Set Buttons */}
            <View style={styles.quickSetContainer}>
              <Text style={styles.quickSetLabel}>Quick Set:</Text>
              <View style={styles.quickSetButtons}>
                <TouchableOpacity
                  style={styles.quickSetButton}
                  onPress={() => handleQuickSet(5000)}
                >
                  <Text style={styles.quickSetButtonText}>5K</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickSetButton}
                  onPress={() => handleQuickSet(10000)}
                >
                  <Text style={styles.quickSetButtonText}>10K</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickSetButton}
                  onPress={() => handleQuickSet(15000)}
                >
                  <Text style={styles.quickSetButtonText}>15K</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickSetButton}
                  onPress={() => handleQuickSet(20000)}
                >
                  <Text style={styles.quickSetButtonText}>20K</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Info Cards */}
          <View style={styles.infoContainer}>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Recommended Goals</Text>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Sedentary:</Text>
                <Text style={styles.infoValue}>5,000 steps</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Active:</Text>
                <Text style={styles.infoValue}>10,000 steps</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Very Active:</Text>
                <Text style={styles.infoValue}>15,000+ steps</Text>
              </View>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>Save Goal</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
    marginTop: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif-medium",
      default: "Inter-Bold",
    }),
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "#888888",
    textAlign: "center",
    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif",
      default: "Inter-Regular",
    }),
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 32,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: "#252525",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  input: {
    flex: 1,
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif-medium",
      default: "Inter-Bold",
    }),
    padding: 0,
  },
  inputLabel: {
    fontSize: 18,
    color: "#888888",
    marginLeft: 12,
    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif",
      default: "Inter-Regular",
    }),
  },
  errorText: {
    color: "#FF5252",
    fontSize: 14,
    marginTop: 12,
    marginLeft: 4,
    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif",
      default: "Inter-Regular",
    }),
  },
  quickSetContainer: {
    marginTop: 24,
  },
  quickSetLabel: {
    fontSize: 14,
    color: "#888888",
    marginBottom: 12,
    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif",
      default: "Inter-Regular",
    }),
  },
  quickSetButtons: {
    flexDirection: "row",
    gap: 12,
  },
  quickSetButton: {
    flex: 1,
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#252525",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  quickSetButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4CAF50",
    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif-medium",
      default: "Inter-SemiBold",
    }),
  },
  infoContainer: {
    marginBottom: 32,
  },
  infoCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#252525",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 16,
    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif-medium",
      default: "Inter-SemiBold",
    }),
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: "#888888",
    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif",
      default: "Inter-Regular",
    }),
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4CAF50",
    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif-medium",
      default: "Inter-SemiBold",
    }),
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#4CAF50",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif-medium",
      default: "Inter-Bold",
    }),
  },
});
