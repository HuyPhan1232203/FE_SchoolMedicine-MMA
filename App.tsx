import { ExpoRoot } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import './lib/firebase'; // Import Firebase config first

// Define the context for ExpoRoot
const ctx = require.context('./app', true, /\.[jt]sx?$/);

export default function App() {
  return (
    <SafeAreaProvider>
      <ExpoRoot context={ctx} />
    </SafeAreaProvider>
  );
} 