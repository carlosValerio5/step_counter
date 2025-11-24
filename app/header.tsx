import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function Header() {
    const db = useSQLiteContext();
    const [version, setVersion] = useState('');
    useEffect(() => {
      async function setup() {
        const result = await db.getFirstAsync<{ 'sqlite_version()': string }>(
          'SELECT sqlite_version()'
        );
        if (result)
            setVersion(result['sqlite_version()']);
        else
            throw Error("Failed to retrieve version");
      }
      setup();
    }, []);
    return (
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>SQLite version: {version}</Text>
      </View>
    );
  }

const styles = StyleSheet.create({
    headerContainer : {
        backgroundColor: 'black',
        justifyContent: "space-between"
    },
    headerText : {
        color: "white",
    }
})