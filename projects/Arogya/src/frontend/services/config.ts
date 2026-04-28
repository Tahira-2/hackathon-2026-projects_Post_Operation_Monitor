import { Platform } from "react-native";

/**
 * API Configuration
 * Centralized configuration for API endpoints
 */

/**
 * API Base URL Configuration
 *
 * Choose the appropriate URL based on your development setup:
 *
 * 1. For Android Emulator:
 *    - Use: http://10.0.2.2:8000
 *
 * 2. For iOS Simulator:
 *    - Use: http://localhost:8000
 *
 * 3. For Physical Device or Expo Go:
 *    - Use your computer's local IP address
 *    - Find your IP:
 *      - Windows: Run `ipconfig` and look for IPv4 Address
 *      - Mac/Linux: Run `ifconfig` or `ip addr`
 *    - Example: http://192.168.1.100:8000
 *
 * 4. For Production:
 *    - Use your production server URL
 *    - Example: https://api.yourdomain.com
 */

// ⚠️ UPDATE THIS WITH YOUR LOCAL IP ADDRESS OR SERVER URL
const LOCAL_IP = "192.168.100.40"; // Your current IP address
const PORT = "8000";

// Determine the API URL based on the platform
const getApiBaseUrl = (): string => {
  // If you want to use different URLs for different platforms
  if (Platform.OS === "android") {
    // For Android Emulator, use 10.0.2.2
    // For Expo Go or physical device, use your local IP
    return `http://${LOCAL_IP}:${PORT}`;
  } else if (Platform.OS === "ios") {
    // For iOS Simulator, you can use localhost
    // For Expo Go or physical device, use your local IP
    return `http://${LOCAL_IP}:${PORT}`;
  } else {
    // For web
    return `http://localhost:${PORT}`;
  }
};

export const API_BASE_URL = getApiBaseUrl();

// Export individual configuration values
export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 30000, // 30 seconds

  // API Endpoints
  ENDPOINTS: {
    // Auth
    LOGIN: "/accounts/login/",
    REGISTER: "/accounts/register/",
    LOGOUT: "/accounts/logout/",
    PROFILE: "/accounts/profile/",

    // Check-ins
    CHECKINS: "/checkins/",

    // Doctors
    DOCTORS: "/doctors/",
    NEARBY_DOCTORS: "/doctors/nearby/",

    // Chat
    MESSAGES: "/chat/",

    // Alerts
    ALERTS: "/alerts/",
    UNREAD_ALERTS: "/alerts/unread_count/",
    CRITICAL_ALERTS: "/alerts/critical_alerts/",

    // Medicines
    MEDICINES: "/medicines/",

    // Reports
    REPORTS: "/reports/",
    UPLOAD_REPORT: "/reports/upload/",
  },
};

export default API_CONFIG;
