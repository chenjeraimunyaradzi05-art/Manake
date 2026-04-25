/**
 * Centralized error messages for the mobile app
 * Use these instead of hardcoding error strings throughout the codebase
 */
export const ERROR_MESSAGES = {
  // Network errors
  NETWORK_ERROR: "Network request failed. Please check your connection.",
  TIMEOUT_ERROR: "Request timed out. Please try again.",
  NO_INTERNET: "No internet connection. Please check your network settings.",

  // Authentication errors
  LOGIN_FAILED: "Login failed. Please check your credentials.",
  REGISTER_FAILED: "Registration failed. Please try again.",
  SESSION_EXPIRED: "Your session has expired. Please log in again.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  INVALID_CREDENTIALS: "Invalid email or password.",

  // Validation errors
  REQUIRED_FIELD: "This field is required.",
  INVALID_EMAIL: "Please enter a valid email address.",
  PASSWORD_TOO_SHORT: "Password must be at least 8 characters.",
  PASSWORDS_DO_NOT_MATCH: "Passwords do not match.",

  // Story errors
  STORY_NOT_FOUND: "Story not found.",
  FAILED_TO_LOAD_STORIES: "Failed to load stories. Please try again.",
  FAILED_TO_LIKE_STORY: "Failed to like story. Please try again.",

  // Donation errors
  DONATION_FAILED: "Donation failed. Please try again.",
  INVALID_AMOUNT: "Please enter a valid donation amount.",
  MINIMUM_DONATION: "Minimum donation amount is $1.",

  // Contact errors
  MESSAGE_SEND_FAILED: "Failed to send message. Please try again.",

  // Profile errors
  PROFILE_UPDATE_FAILED: "Failed to update profile. Please try again.",
  FAILED_TO_LOAD_PROFILE: "Failed to load profile. Please try again.",

  // Generic errors
  SOMETHING_WENT_WRONG: "Something went wrong. Please try again.",
  UNKNOWN_ERROR: "An unknown error occurred.",
} as const;

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Welcome back!",
  REGISTER_SUCCESS: "Account created successfully!",
  LOGOUT_SUCCESS: "You have been logged out.",
  PROFILE_UPDATED: "Profile updated successfully.",
  MESSAGE_SENT: "Message sent successfully.",
  DONATION_SUCCESS: "Thank you for your donation!",
  STORY_LIKED: "Story liked!",
  STORY_UNLIKED: "Story unliked.",
} as const;

export type ErrorMessageKey = keyof typeof ERROR_MESSAGES;
export type SuccessMessageKey = keyof typeof SUCCESS_MESSAGES;
