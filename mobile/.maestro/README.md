# Maestro E2E Tests — Cashence

End-to-end tests using [Maestro](https://maestro.mobile.dev/) for the Cashence mobile app.

## Prerequisites

1. **Maestro CLI** installed:
   ```bash
   # macOS/Linux
   curl -Ls "https://get.maestro.mobile.dev" | bash
   
   # or via Homebrew
   brew tap mobile-dev-inc/tap && brew install maestro
   ```
   > ⚠️ On Windows, Maestro requires WSL2.

2. **Android Emulator** or **iOS Simulator** running

3. **Development build** of Cashence installed on the emulator:
   ```bash
   npx expo run:android
   # or
   npx expo run:ios
   ```

## Running Tests

```bash
# Run all test flows
maestro test .maestro/

# Run a specific flow
maestro test .maestro/login_flow.yaml
maestro test .maestro/create_transaction.yaml
maestro test .maestro/navigate_analytics.yaml
```

## Test Flows

| Flow | Description |
|---|---|
| `login_flow.yaml` | Sign in with email/password, verify home screen |
| `create_transaction.yaml` | Add a new transaction, verify submission |
| `navigate_analytics.yaml` | Navigate to Analytics tab, verify charts render |

## Notes

- Tests use `testID` props on components for reliable selectors. If tests fail, ensure the corresponding `testID` / `id` attributes exist on the target components.
- Update the test credentials in `login_flow.yaml` to match a valid test account.
- Maestro tests run against **development builds**, not Expo Go.
