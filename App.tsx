import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import DesignSystemDemo from './src/screens/DesignSystemDemo';

export default function App() {
  return (
    <View style={styles.container}>
      <DesignSystemDemo />
      <StatusBar style='auto' />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F2E8', // Warm cream from PocketTherapy design
  },
});
