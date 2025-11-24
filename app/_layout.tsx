import { Stack } from "expo-router";
import { SQLiteProvider } from 'expo-sqlite';
import Calories from "./calories";
import Header from "./header";
import { ProfileStoreProvider } from "./profile";
import Sensors from "./sensors";
import { migrateDbIfNeeded } from "./utils/database";

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName='step_tracker.db' onInit={migrateDbIfNeeded}>
      <ProfileStoreProvider>

        <Header />
        <Sensors />
        <Calories />
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </ProfileStoreProvider>
    </ SQLiteProvider>
  );
}
