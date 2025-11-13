import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  Dimensions,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, G } from "react-native-svg";
import { useCaloriesStore } from "./calories";
import { useGoalStore } from "./goals";
import { useStepStore } from "./sensors";

const { width } = Dimensions.get("window");
const CIRCLE_SIZE = width * 0.7;
const STROKE_WIDTH = 20;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const options = {
  headerShown: false,
};

export default function Index() {
  const router = useRouter();
  
  const currentSteps = useStepStore((state)=>state.steps);
  const dailyGoal = useGoalStore((state) => state.goal);
  const progress = Math.min(currentSteps / dailyGoal, 1);
  const calories = useCaloriesStore((state)=>state.calories);

  const progressValue = useSharedValue(0);

  // Get color based on progress for percentage text
  const getProgressColor = (prog: number): string => {
    if (prog <= 0) return "#FF5252"; // Red
    if (prog >= 1) return "#4CAF50"; // Green
    
    if (prog < 0.5) {
      // Red to Yellow (0 to 0.5)
      const ratio = prog / 0.5;
      // Interpolate between red and yellow
      const r = Math.round(255 - (255 - 255) * ratio); // 255
      const g = Math.round(82 + (193 - 82) * ratio); // 82 to 193
      const b = Math.round(82 + (7 - 82) * ratio); // 82 to 7
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      // Yellow to Green (0.5 to 1)
      const ratio = (prog - 0.5) / 0.5;
      // Interpolate between yellow and green
      const r = Math.round(255 - (76 - 255) * ratio); // 255 to 76
      const g = Math.round(193 + (175 - 193) * ratio); // 193 to 175
      const b = Math.round(7 + (80 - 7) * ratio); // 7 to 80
      return `rgb(${r}, ${g}, ${b})`;
    }
  };

  useEffect(() => {
    progressValue.value = withTiming(progress, {
      duration: 1500,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = CIRCUMFERENCE * (1 - progressValue.value);
    
    // Interpolate color from red -> yellow -> green based on progress
    // 0-0.5: red to yellow, 0.5-1: yellow to green
    const color = interpolateColor(
      progressValue.value,
      [0, 0.5, 1],
      ["#FF5252", "#FFC107", "#4CAF50"] // red, yellow, green
    );
    
    return {
      strokeDashoffset,
      stroke: color,
    };
  });

  const animatedGlowProps = useAnimatedProps(() => {
    // Lighter version of the main color for the glow effect
    const color = interpolateColor(
      progressValue.value,
      [0, 0.5, 1],
      ["#FF7979", "#FFD54F", "#66BB6A"] // lighter red, lighter yellow, lighter green
    );
    
    return {
      stroke: color,
    };
  });

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Step Tracker</Text>
          <Text style={styles.subtitle}>Today's Progress</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.goalButton}
              onPress={() => router.push("/goals")}
              activeOpacity={0.7}
            >
              <Text style={styles.goalButtonText}>Set Goal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.goalButton}
              onPress={() => router.push("/profile")}
              activeOpacity={0.7}
            >
              <Text style={styles.goalButtonText}>Set Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Circular Progress Indicator */}
        <View style={styles.circleContainer}>
          <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} style={styles.svg}>
            {/* Background Circle */}
            <Circle
              cx={CIRCLE_SIZE / 2}
              cy={CIRCLE_SIZE / 2}
              r={RADIUS}
              stroke="#1A1A1A"
              strokeWidth={STROKE_WIDTH}
              fill="transparent"
            />
            {/* Progress Circle */}
            <G rotate="-90deg" origin={`${CIRCLE_SIZE / 2}, ${CIRCLE_SIZE / 2}`}>
              <AnimatedCircle
                cx={CIRCLE_SIZE / 2}
                cy={CIRCLE_SIZE / 2}
                r={RADIUS}
                strokeWidth={STROKE_WIDTH}
                fill="transparent"
                strokeDasharray={CIRCUMFERENCE}
                strokeLinecap="round"
                animatedProps={animatedProps}
              />
              {/* Gradient effect circle (inner glow) */}
              <AnimatedCircle
                cx={CIRCLE_SIZE / 2}
                cy={CIRCLE_SIZE / 2}
                r={RADIUS}
                strokeWidth={STROKE_WIDTH * 0.3}
                fill="transparent"
                strokeDasharray={CIRCUMFERENCE}
                strokeLinecap="round"
                opacity={0.6}
                animatedProps={animatedGlowProps}
              />
            </G>
          </Svg>

          {/* Center Content */}
          <View style={styles.centerContent}>
            <Text style={styles.stepCount}>{currentSteps.toLocaleString()}</Text>
            <Text style={styles.stepLabel}>steps</Text>
            <Text style={styles.goalText}>Calories {calories}</Text>
            <View style={styles.divider} />
            <Text style={styles.goalText}>Goal: {dailyGoal.toLocaleString()}</Text>
            <Text style={[styles.percentageText, { color: getProgressColor(progress) }]}>
              {Math.round(progress * 100)}%
            </Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {dailyGoal - currentSteps > 0
                ? (dailyGoal - currentSteps).toLocaleString()
                : "0"}
            </Text>
            <Text style={styles.statLabel}>Steps Remaining</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {Math.round((currentSteps / dailyGoal) * 100)}%
            </Text>
            <Text style={styles.statLabel}>Complete</Text>
          </View>
        </View>

        {/* Bottom Info */}
        <View style={styles.bottomInfo}>
          <Text style={styles.infoText}>
            Keep moving! You're doing great! 🚶‍♂️
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
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
    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif",
      default: "Inter-Regular",
    }),
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  goalButton: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#252525",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
  goalButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4CAF50",
    textAlign: "center",
    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif-medium",
      default: "Inter-SemiBold",
    }),
  },
  circleContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: CIRCLE_SIZE,
    marginTop: 20,
    marginBottom: 40,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  svg: {
    position: "absolute",
  },
  centerContent: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
  },
  stepCount: {
    fontSize: 48,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif-medium",
      default: "Inter-Bold",
    }),
    marginBottom: 4,
  },
  stepLabel: {
    fontSize: 18,
    color: "#888888",
    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif",
      default: "Inter-Regular",
    }),
    marginBottom: 12,
  },
  divider: {
    width: 40,
    height: 1,
    backgroundColor: "#333333",
    marginVertical: 12,
  },
  goalText: {
    fontSize: 14,
    color: "#666666",
    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif",
      default: "Inter-Regular",
    }),
    marginBottom: 4,
  },
  percentageText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#4CAF50",
    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif-medium",
      default: "Inter-SemiBold",
    }),
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 32,
    marginBottom: 8,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    minHeight: 120,
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
    borderWidth: 1,
    borderColor: "#252525",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif-medium",
      default: "Inter-Bold",
    }),
  },
  statLabel: {
    fontSize: 14,
    color: "#888888",
    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif",
      default: "Inter-Regular",
    }),
  },
  bottomInfo: {
    marginTop: 32,
    alignItems: "center",
    paddingVertical: 20,
    paddingBottom: 10,
  },
  infoText: {
    fontSize: 16,
    color: "#666666",
    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif",
      default: "Inter-Regular",
    }),
    textAlign: "center",
  },
});
