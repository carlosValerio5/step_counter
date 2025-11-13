import { useEffect } from "react";
import { create } from "zustand";
import { useProfileStore } from "./profile";
import { useStepStore } from "./sensors";
import type { CaloriesStore } from "./types/caloriesStore";

export const useCaloriesStore = create<CaloriesStore>((set)=>({
    calories: 0,
    setCalories: (calories) => set({calories}),
}))


export default function Calories() {
  const { setCalories } = useCaloriesStore();
  const { height: storedHeight, weight: storedWeight, setHeight, setWeight } = useProfileStore();
  const { steps }  = useStepStore();

  // Metric for level of intensity, using moderate intensity for now.
  const MET = 3.8;

  // Moderate pace 80 steps per minute.
  useEffect(()=> {
    let kcal = (steps / 80) * (MET * 3.5 * storedWeight / 200);
    kcal = +kcal.toFixed(2);
    setCalories(kcal)
  }, [steps, storedWeight])

  return null;
}