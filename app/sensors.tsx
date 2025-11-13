import {
    Pedometer
} from "expo-sensors";
import { useEffect, useRef } from "react";
import { create } from "zustand";
import type { StepStore } from "./types/stepStore";

export const useStepStore = create<StepStore>((set) => ({
    steps: 0,
    setSteps: (steps) => set({ steps }),
}));

/**
 * Background sensor service component that tracks steps
 * This component runs in the background and updates the step store
 */
export default function Sensors() {
    const subscriptionRef = useRef<any>(null);
    const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const initialWatchCountRef = useRef<number | null>(null);
    const baseStepCountRef = useRef<number>(0);
    const { setSteps } = useStepStore();

    const checkAndRequestPedometerPermission = async (): Promise<boolean> => {
        try {
            // Request permission - this will show the dialog if permission hasn't been determined
            // If already granted, it will return 'granted' without showing a dialog
            // If denied, it will return 'denied' without showing a dialog
            console.log('Requesting pedometer permission...');
            const { status } = await Pedometer.requestPermissionsAsync();
            console.log('Permission status:', status);
            
            if (status === 'granted') {
                console.log('✅ Pedometer permission granted');
                return true;
            } else if (status === 'denied') {
                console.warn('❌ Pedometer permission denied. User needs to enable it in device settings.');
                return false;
            } else {
                console.warn('⚠️ Pedometer permission status:', status);
                return false;
            }
        } catch (error) {
            console.error('Error requesting pedometer permission:', error);
            return false;
        }
    };

    const updateStepCount = () => {
        // Get today's accurate step count from the system
        const end = new Date();
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        
        Pedometer.getStepCountAsync(start, end).then((result) => {
            if (result) {
                baseStepCountRef.current = result.steps;
                setSteps(result.steps);
                console.log('Updated step count from system:', result.steps);
            }
        }).catch((error) => {
            console.error('Error updating step count:', error);
        });
    };

    const initializeStepTracking = async () => {
        try {
            const isAvailable = await Pedometer.isAvailableAsync();
            if (!isAvailable) {
                console.warn('Pedometer is not available on this device');
                return;
            }

            // Check and request permission if needed
            const hasPermission = await checkAndRequestPedometerPermission();
            if (!hasPermission) {
                console.warn('Pedometer permission not granted');
                return;
            }

            // Get today's accurate step count first (this is the base count)
            const end = new Date();
            const start = new Date();
            start.setHours(0, 0, 0, 0);
            
            const todaySteps = await Pedometer.getStepCountAsync(start, end);
            if (todaySteps) {
                baseStepCountRef.current = todaySteps.steps;
                setSteps(todaySteps.steps);
                console.log('Initial step count for today:', todaySteps.steps);
            }

            // Watch for step count updates in real-time
            // Note: watchStepCount returns steps from when the watch started,
            // so we'll use it to detect changes and periodically refresh from getStepCountAsync
            const subscription = Pedometer.watchStepCount((result) => {
                // Store the initial watch count on first update
                if (initialWatchCountRef.current === null) {
                    initialWatchCountRef.current = result.steps;
                    console.log('Initial watch count:', result.steps);
                }
                
                // Periodically refresh from getStepCountAsync to get accurate count
                // This ensures we don't lose steps if the watch count resets
                updateStepCount();
            });

            subscriptionRef.current = subscription;

            // Also set up a periodic refresh every 30 seconds to ensure accuracy
            refreshIntervalRef.current = setInterval(() => {
                updateStepCount();
            }, 30000); // Refresh every 30 seconds
        } catch (error) {
            console.error('Error initializing step tracking:', error);
        }
    };

    useEffect(() => {
        initializeStepTracking();

        // Cleanup subscription and interval on unmount
        return () => {
            if (subscriptionRef.current) {
                subscriptionRef.current.remove();
                subscriptionRef.current = null;
            }
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
                refreshIntervalRef.current = null;
            }
        };
    }, []);

    // This component doesn't render anything - it runs in the background
    return null;
}