import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Request notification permissions from the user.
 * Returns true if granted.
 */
export async function requestNotificationPermissions() {
  if (Platform.OS === 'web') return false;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

/**
 * Schedule an immediate local notification for a budget alert.
 * @param {string} category - Budget category name
 * @param {number} percentage - Current spending percentage
 * @param {number} spent - Amount spent
 * @param {number} limit - Budget limit
 */
export async function sendBudgetAlert(category, percentage, spent, limit) {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  const isExceeded = percentage >= 100;
  const title = isExceeded
    ? `🚨 Budget Exceeded: ${category}`
    : `⚠️ Budget Warning: ${category}`;
  const body = isExceeded
    ? `You've spent ₹${spent.toLocaleString('en-IN')} of your ₹${limit.toLocaleString('en-IN')} budget (${percentage}%).`
    : `You've used ${percentage}% of your ${category} budget (₹${spent.toLocaleString('en-IN')} / ₹${limit.toLocaleString('en-IN')}).`;

  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: null, // fires immediately
  });
}

/**
 * Check all budgets for the current month and fire alerts
 * for any that hit 75% or 90%+ thresholds.
 * @param {Function} fetchWithAuth - authenticated fetch function
 */
export async function checkBudgetThresholds(fetchWithAuth) {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const budgets = await fetchWithAuth(`/budgets?month=${month}&year=${year}`);
    if (!Array.isArray(budgets)) return;

    for (const budget of budgets) {
      if (budget.percentage >= 90) {
        await sendBudgetAlert(budget.category, budget.percentage, budget.spent, budget.limit);
      } else if (budget.percentage >= 75) {
        await sendBudgetAlert(budget.category, budget.percentage, budget.spent, budget.limit);
      }
    }
  } catch (error) {
    console.error('Budget threshold check failed:', error);
  }
}

