const DEMO_ENV_KEY = 'EXPO_PUBLIC_DEMO_MODE';

function isDemoModeEnabled(env = process.env) {
  const value =
    env === process.env ? process.env.EXPO_PUBLIC_DEMO_MODE : env?.[DEMO_ENV_KEY];
  return value === '1' || value === 'true' || value === 'yes';
}

module.exports = {
  DEMO_ENV_KEY,
  isDemoModeEnabled,
};
