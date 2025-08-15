import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { AuthProvider } from '@context';
import { AuthGuard } from '@components';
import DesignSystemDemo from './src/screens/DesignSystemDemo';

export default function App() {
  return (
    <AuthProvider>
      <View style={styles.container}>
        <AuthGuard>
          <DesignSystemDemo />
        </AuthGuard>
        <StatusBar style='auto' />
      </View>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F2E8', // Warm cream from PocketTherapy design
  },
});
