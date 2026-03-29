import { StyleSheet } from "react-native";

export const getStyles = (COLORS) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 32,
    justifyContent: "center",
  },
  illustration: {
    display: "none"
  },
  title: {
    fontSize: 48,
    fontWeight: "900",
    color: COLORS.text, 
    letterSpacing: -1.5,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "500",
    color: COLORS.textLight,
    marginBottom: 60,
  },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 24,
    fontSize: 18,
    color: COLORS.text, 
    fontWeight: "500",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  passwordInput: {
    flex: 1,
    padding: 24,
    fontSize: 18,
    color: COLORS.text,
    fontWeight: "500",
  },
  eyeIcon: {
    padding: 24,
  },
  buttonContainer: {
    marginTop: 32,
  },
  button: {
    backgroundColor: COLORS.primary, 
    padding: 22,
    borderRadius: 100,
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 64,
  },
  footerText: {
    color: COLORS.textLight,
    fontSize: 16,
    fontWeight: "500",
  },
  linkText: {
    color: COLORS.primary, 
    fontWeight: "800",
    marginLeft: 8,
    fontSize: 16,
  },
  errorBox: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  errorText: {
    color: COLORS.expense,
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  errorInput: {
    borderColor: COLORS.expense,
  },
  fieldErrorText: {
    color: COLORS.expense,
    fontSize: 14,
    marginBottom: 16,
    marginTop: -8,
    marginLeft: 4,
  }
});