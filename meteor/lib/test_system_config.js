/**
 * Selenium Node configuration
 */
SeleniumNodeConfig = new SimpleSchema({
  timeout: {
    label: "Timeout",
    type: Number,
    defaultValue: 300
  },
  maxSessions: {
    label: "Max Concurrent Sessions",
    type: Number,
    defaultValue: 5
  },
  platform: {
    label: "Platform",
    type: String,
    allowedValues: ["MAC", "WINDOWS", "LINUX"]
  }
});

/**
 * Selenium Hub configuration
 */
SeleniumHubConfig = {

};

/**
 * Appium configuration
 */
AppiumConfig = {

};