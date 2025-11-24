import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';

export default function Header() {
    const db = useSQLiteContext();
    const [version, setVersion] = useState('');
    useEffect(() => {
      async function setup() {
        const result = await db.getFirstAsync<{ 'sqlite_version()': string }>(
          'SELECT sqlite_version()'
        );
        if (result){
            setVersion(result['sqlite_version()']);
            console.log(result['sqlite_version()'])
        }
        else
            throw Error("Failed to retrieve version");
      }
      setup();
    }, []);
    return null;
  }
