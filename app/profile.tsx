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

type ProfileStore = {
  height: number; // stored in meters
  weight: number; // stored in kg
  setHeight: (height: number) => void;
  setWeight: (weight: number) => void;
};

export const useProfileStore = create<ProfileStore>((set) => ({
  height: 0,
  weight: 0,
  setHeight: (height) => set({ height }),
  setWeight: (weight) => set({ weight }),
}));

type HeightUnit = "metric" | "imperial";
type WeightUnit = "kg" | "lbs";

export default function Profile() {
  const router = useRouter();
  const { height: storedHeight, weight: storedWeight, setHeight, setWeight } = useProfileStore();

  // Height state
  const [heightUnit, setHeightUnit] = useState<HeightUnit>("metric");
  const [heightMeters, setHeightMeters] = useState(
    storedHeight > 0 ? storedHeight.toString() : ""
  );
  const [heightFeet, setHeightFeet] = useState(
    storedHeight > 0 ? Math.floor(storedHeight * 3.28084).toString() : ""
  );
  const [heightInches, setHeightInches] = useState(
    storedHeight > 0
      ? Math.round((storedHeight * 3.28084 - Math.floor(storedHeight * 3.28084)) * 12).toString()
      : ""
  );

  // Weight state
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("kg");
  const [weightKg, setWeightKg] = useState(
    storedWeight > 0 ? storedWeight.toString() : ""
  );
  const [weightLbs, setWeightLbs] = useState(
    storedWeight > 0 ? (storedWeight * 2.20462).toFixed(1) : ""
  );

  const [error, setError] = useState("");

  // Conversion functions
  const convertHeightToMeters = (): number => {
    if (heightUnit === "metric") {
      const meters = parseFloat(heightMeters);
      return isNaN(meters) ? 0 : meters;
    } else {
      const feet = parseFloat(heightFeet) || 0;
      const inches = parseFloat(heightInches) || 0;
      const totalInches = feet * 12 + inches;
      return totalInches * 0.0254; // inches to meters
    }
  };

  const convertWeightToKg = (): number => {
    if (weightUnit === "kg") {
      const kg = parseFloat(weightKg);
      return isNaN(kg) ? 0 : kg;
    } else {
      const lbs = parseFloat(weightLbs);
      return isNaN(lbs) ? 0 : lbs * 0.453592; // pounds to kg
    }
  };

  const handleHeightUnitChange = (unit: HeightUnit) => {
    setHeightUnit(unit);
    setError("");

    // Convert values when switching units
    const currentHeightMeters = convertHeightToMeters();
    if (currentHeightMeters > 0) {
      if (unit === "imperial") {
        const totalFeet = currentHeightMeters * 3.28084;
        setHeightFeet(Math.floor(totalFeet).toString());
        setHeightInches(Math.round((totalFeet - Math.floor(totalFeet)) * 12).toString());
      } else {
        setHeightMeters(currentHeightMeters.toFixed(2));
      }
    }
  };

  const handleWeightUnitChange = (unit: WeightUnit) => {
    setWeightUnit(unit);
    setError("");

    // Convert values when switching units
    const currentWeightKg = convertWeightToKg();
    if (currentWeightKg > 0) {
      if (unit === "lbs") {
        setWeightLbs((currentWeightKg * 2.20462).toFixed(1));
      } else {
        setWeightKg(currentWeightKg.toFixed(1));
      }
    }
  };

  const handleSave = () => {
    const heightM = convertHeightToMeters();
    const weightKg = convertWeightToKg();

    // Validation
    if (heightM <= 0 || heightM > 3) {
      setError("Please enter a valid height (0.5m - 3m or 1'6\" - 9'10\")");
      return;
    }

    if (weightKg <= 0 || weightKg > 500) {
      setError("Please enter a valid weight (1kg - 500kg or 2lbs - 1100lbs)");
      return;
    }

    setError("");
    setHeight(heightM);
    setWeight(weightKg);
    router.back();
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
            <Text style={styles.title}>Profile Settings</Text>
            <Text style={styles.subtitle}>
              Enter your height and weight for accurate calorie calculations
            </Text>
          </View>

          {/* Height Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Height</Text>

            {/* Unit Toggle */}
            <View style={styles.unitToggle}>
              <TouchableOpacity
                style={[
                  styles.unitButton,
                  heightUnit === "metric" && styles.unitButtonActive,
                ]}
                onPress={() => handleHeightUnitChange("metric")}
              >
                <Text
                  style={[
                    styles.unitButtonText,
                    heightUnit === "metric" && styles.unitButtonTextActive,
                  ]}
                >
                  Meters
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.unitButton,
                  heightUnit === "imperial" && styles.unitButtonActive,
                ]}
                onPress={() => handleHeightUnitChange("imperial")}
              >
                <Text
                  style={[
                    styles.unitButtonText,
                    heightUnit === "imperial" && styles.unitButtonTextActive,
                  ]}
                >
                  Feet & Inches
                </Text>
              </TouchableOpacity>
            </View>

            {/* Height Input */}
            {heightUnit === "metric" ? (
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={heightMeters}
                  onChangeText={(text) => {
                    setHeightMeters(text);
                    setError("");
                  }}
                  placeholder="1.75"
                  placeholderTextColor="#666666"
                  keyboardType="decimal-pad"
                  selectTextOnFocus
                />
                <Text style={styles.inputLabel}>meters</Text>
              </View>
            ) : (
              <View style={styles.imperialInputContainer}>
                <View style={[styles.inputWrapper, styles.imperialInput]}>
                  <TextInput
                    style={styles.input}
                    value={heightFeet}
                    onChangeText={(text) => {
                      setHeightFeet(text);
                      setError("");
                    }}
                    placeholder="5"
                    placeholderTextColor="#666666"
                    keyboardType="number-pad"
                    selectTextOnFocus
                  />
                  <Text style={styles.inputLabel}>ft</Text>
                </View>
                <View style={[styles.inputWrapper, styles.imperialInput]}>
                  <TextInput
                    style={styles.input}
                    value={heightInches}
                    onChangeText={(text) => {
                      setHeightInches(text);
                      setError("");
                    }}
                    placeholder="10"
                    placeholderTextColor="#666666"
                    keyboardType="number-pad"
                    selectTextOnFocus
                  />
                  <Text style={styles.inputLabel}>in</Text>
                </View>
              </View>
            )}
          </View>

          {/* Weight Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weight</Text>

            {/* Unit Toggle */}
            <View style={styles.unitToggle}>
              <TouchableOpacity
                style={[
                  styles.unitButton,
                  weightUnit === "kg" && styles.unitButtonActive,
                ]}
                onPress={() => handleWeightUnitChange("kg")}
              >
                <Text
                  style={[
                    styles.unitButtonText,
                    weightUnit === "kg" && styles.unitButtonTextActive,
                  ]}
                >
                  Kilograms
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.unitButton,
                  weightUnit === "lbs" && styles.unitButtonActive,
                ]}
                onPress={() => handleWeightUnitChange("lbs")}
              >
                <Text
                  style={[
                    styles.unitButtonText,
                    weightUnit === "lbs" && styles.unitButtonTextActive,
                  ]}
                >
                  Pounds
                </Text>
              </TouchableOpacity>
            </View>

            {/* Weight Input */}
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={weightUnit === "kg" ? weightKg : weightLbs}
                onChangeText={(text) => {
                  if (weightUnit === "kg") {
                    setWeightKg(text);
                  } else {
                    setWeightLbs(text);
                  }
                  setError("");
                }}
                placeholder={weightUnit === "kg" ? "70" : "154"}
                placeholderTextColor="#666666"
                keyboardType="decimal-pad"
                selectTextOnFocus
              />
              <Text style={styles.inputLabel}>
                {weightUnit === "kg" ? "kg" : "lbs"}
              </Text>
            </View>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Save Button */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>Save Profile</Text>
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 16,
    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif-medium",
      default: "Inter-SemiBold",
    }),
  },
  unitToggle: {
    flexDirection: "row",
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#252525",
  },
  unitButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  unitButtonActive: {
    backgroundColor: "#4CAF50",
  },
  unitButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#888888",
    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif-medium",
      default: "Inter-SemiBold",
    }),
  },
  unitButtonTextActive: {
    color: "#FFFFFF",
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
  imperialInputContainer: {
    flexDirection: "row",
    gap: 12,
  },
  imperialInput: {
    flex: 1,
  },
  input: {
    flex: 1,
    fontSize: 24,
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
    marginBottom: 8,
    marginLeft: 4,
    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif",
      default: "Inter-Regular",
    }),
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 32,
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

