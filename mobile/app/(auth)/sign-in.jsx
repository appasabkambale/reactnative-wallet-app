import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getStyles } from '../../assets/styles/auth.styles';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../config/supabase';

export default function SignIn() {
  const router = useRouter();
  const { COLORS } = useTheme();
  const styles = getStyles(COLORS);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    let newErrors = {};
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSignInPress = async () => {
    if (!validate()) return;
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      setError(error.message);
    } else {
      router.replace('/');
    }
    setLoading(false);
  };

  return (
    <KeyboardAwareScrollView 
      style={{ flex: 1, backgroundColor: COLORS.background }} 
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid={true}
      extraScrollHeight={20}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in with Supabase securely</Text>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={20} color={COLORS.expense} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => setError(null)}>
              <Ionicons name="close" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          </View>
        ) : null}

        <TextInput
          style={[styles.input, errors.email ? styles.errorInput : null]}
          autoCapitalize="none"
          value={email}
          placeholder="Enter email"
          placeholderTextColor={COLORS.textLight}
          onChangeText={(text) => { setEmail(text); if(errors.email) setErrors({...errors, email: null}); }}
        />
        {errors.email ? <Text style={styles.fieldErrorText}>{errors.email}</Text> : null}
        
        <View style={[styles.passwordContainer, errors.password ? styles.errorInput : null]}>
          <TextInput
            style={styles.passwordInput}
            autoCapitalize="none"
            value={password}
            placeholder="Enter password"
            secureTextEntry={!showPassword}
            placeholderTextColor={COLORS.textLight}
            onChangeText={(text) => { setPassword(text); if(errors.password) setErrors({...errors, password: null}); }}
          />
          <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color={COLORS.textLight} />
          </TouchableOpacity>
        </View>
        {errors.password ? <Text style={styles.fieldErrorText}>{errors.password}</Text> : null}
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={onSignInPress} disabled={loading}>
              <Text style={styles.buttonText}>{loading ? "Signing In..." : "Sign In"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <Link href="/sign-up" asChild>
            <TouchableOpacity>
              <Text style={styles.linkText}>Sign up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}
