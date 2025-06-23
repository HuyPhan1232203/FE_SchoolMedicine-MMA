import { ExpoRoot } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import './constants/firebaseConfig'; // Import Firebase config first

export default function App() {
  return (
    <SafeAreaProvider>
      <ExpoRoot />
    </SafeAreaProvider>
  );
} 