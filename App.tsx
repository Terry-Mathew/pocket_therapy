import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import DependencyTest from './DependencyTest';

export default function App() {
  return (
    <View style={styles.container}>
      <DependencyTest />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F2E8', // Warm cream from PocketTherapy design
  },
});
