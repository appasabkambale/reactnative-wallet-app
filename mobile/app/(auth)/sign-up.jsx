import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useToast } from '../../context/ToastContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getStyles } from '../../assets/styles/auth.styles';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../config/supabase';

export default function SignUp() {
  const router = useRouter();
  const { COLORS } = useTheme();
  const styles = getStyles(COLORS);
  const { showToast } = useToast();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    let newErrors = {};
    if (!firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSignUpPress = async () => {
    if (!validate()) return;
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        }
      }
    });
    
    if (error) {
      setError(error.message);
    } else {
      showToast({ type: 'success', text1: 'Welcome!', text2: 'Account created successfully!' });
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
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join securely via Supabase</Text>

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
          style={[styles.input, errors.firstName ? styles.errorInput : null]}
          autoCapitalize="words"
          value={firstName}
          placeholder="First Name"
          placeholderTextColor={COLORS.textLight}
          onChangeText={(text) => { setFirstName(text); if(errors.firstName) setErrors({...errors, firstName: null}); }}
        />
        {errors.firstName ? <Text style={styles.fieldErrorText}>{errors.firstName}</Text> : null}

        <TextInput
          style={[styles.input, errors.lastName ? styles.errorInput : null]}
          autoCapitalize="words"
          value={lastName}
          placeholder="Last Name"
          placeholderTextColor={COLORS.textLight}
          onChangeText={(text) => { setLastName(text); if(errors.lastName) setErrors({...errors, lastName: null}); }}
        />
        {errors.lastName ? <Text style={styles.fieldErrorText}>{errors.lastName}</Text> : null}

        <TextInput
          style={[styles.input, errors.email ? styles.errorInput : null]}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          placeholder="Email Address"
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
          <TouchableOpacity style={styles.button} onPress={onSignUpPress} disabled={loading}>
              <Text style={styles.buttonText}>{loading ? "Creating..." : "Sign Up"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Link href="/sign-in" asChild>
            <TouchableOpacity>
              <Text style={styles.linkText}>Sign In</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}
