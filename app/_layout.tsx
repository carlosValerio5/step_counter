import { Stack } from "expo-router";
import Calories from "./calories";
import Sensors from "./sensors";

export default function RootLayout() {
  return (
    <>
      <Sensors />
      <Calories />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </>
  );
}
