import { Stack } from "expo-router";
import { SQLiteProvider } from 'expo-sqlite';
import Calories from "./calories";
import Header from "./header";
import Sensors from "./sensors";
import { migrateDbIfNeeded } from "./utils/database";

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName='step_tracker.db' onInit={migrateDbIfNeeded}>
      <Header />
      <Sensors />
      <Calories />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
      </ SQLiteProvider>
  );
}
