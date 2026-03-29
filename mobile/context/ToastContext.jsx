import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { Animated, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useTheme } from './ThemeContext';

const ToastContext = createContext({});

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toastConfig, setToastConfig] = useState(null);
  const slideAnim = useRef(new Animated.Value(150)).current;
  const { COLORS } = useTheme();

  const showToast = useCallback(({ type, text1, text2 }) => {
    setToastConfig({ type, text1, text2 });
    
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8,
    }).start();

    setTimeout(() => {
      Animated.timing(slideAnim, {
        toValue: 150,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setToastConfig(null));
    }, 3500);
  }, [slideAnim]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toastConfig && (
        <Animated.View style={[
          styles.toastContainer, 
          { 
              transform: [{ translateY: slideAnim }],
              backgroundColor: COLORS.card,
              borderLeftColor: toastConfig.type === 'error' ? COLORS.expense : COLORS.income,
          }
        ]}>
          <SafeAreaView>
            <Text style={[styles.text1, { color: COLORS.text }]}>{toastConfig.text1}</Text>
            {toastConfig.text2 && <Text style={[styles.text2, { color: COLORS.textLight }]}>{toastConfig.text2}</Text>}
          </SafeAreaView>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
    width: '90%',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 9999,
  },
  text1: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  text2: { fontSize: 14 }
});
