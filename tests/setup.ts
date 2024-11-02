import { test as setup } from '@demo/test';
import * as constants from '@constants/general-constants';
import { loginAsUser, loginAsAdminUser } from '@helpers/auth-helpers';
import { LaunchDarklyHelper } from '@lib/api/launch-darkly/launch-darkly';
import { setupAccountAndLogin } from '@helpers/account-setup-helper';
import { copyFile } from '@helpers/utility-helpers';
import { buildAccountConfig } from '@helpers/config-helper';

setup('authenticate as default test user', async ({}) => {
  // Store Default automation login in the DEFAULT_SALES_REP_AUTH storage state
  // in case some tests still need to use it, after logo gen
  console.log('Authenticating as default Automation Sales Rep user...');
  const defaultContext = await loginAsUser(
    process.env.USERNAME,
    process.env.PASSWORD,
    constants.DEFAULT_SALES_REP_AUTH
  );

  // Check if SETUP_LOGO is true and we are on dev. Logogen can only be done on Dev
  if (process.env.ENV === 'dev' && process.env.SETUP_LOGO && process.env.SETUP_LOGO.toLowerCase() === 'true') {
    console.log('Logogen is enabled. Setting up new Logo and authenticating as logogen user...');

    // Sets up logo and then authenticates using constants.DEFAULT_USER_AUTH. We'll pass the default authenticated context to request some APIs as well
    try {
      await setupLogoAndLogin(constants.DEFAULT_USER_AUTH, defaultContext);
    }
    catch(e) {
      console.error("Logogen failed. Using default logo")
      copyFile(constants.DEFAULT_SALES_REP_AUTH, constants.DEFAULT_USER_AUTH, "Authenticated as default user!")
      await buildAccountConfig(constants.DEFAULT_USER_AUTH, defaultContext);
    }
  } else {
    console.log('LogoGen is not enabled. Authenticating as default user...');
    // Copy the default sales rep auth to default user auth so both are use the same authentication when there is no logogen. Saves time.
    copyFile(constants.DEFAULT_SALES_REP_AUTH, constants.DEFAULT_USER_AUTH, 'Authenticated as default user!');
    await buildAccountConfig(constants.DEFAULT_USER_AUTH, defaultContext);
  }
});

setup('authenticate as Another User', async ({}) => {
  console.log('Authenticating as Another User...');

  // Authenticate via API
  await loginAsUser(constants.NSE_LEGACY_ESTIMATE_USER, process.env.PASSWORD, constants.NSE_LEGACY_ESTIMATE_USER_AUTH);
});

