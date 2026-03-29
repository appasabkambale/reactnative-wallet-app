import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const PageLoader = () => {
  const { COLORS } = useTheme();

  return (
    <View style={[styles.loadingContainer, { backgroundColor: COLORS.background }]}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  )
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  }
});

export default PageLoader;