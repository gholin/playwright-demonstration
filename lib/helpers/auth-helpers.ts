import { APIRequestContext, BrowserContext, request, Page, APIResponse } from '@playwright/test';
import { APIHeader } from '@models';
import * as fs from 'fs';
import * as constants from '@constants/general-constants';
import { readLocalConfig } from '@helpers/config-helper';
import { readStorageState } from '@helpers/utility-helpers';
import { AuthHelper } from '@lib/api/auth';

export async function loginAsUser(
  username: string,
  password: string,
  storageStatePath: string = constants.DEFAULT_USER_AUTH
) : Promise<APIRequestContext> {
  // Create Empty Storage State File if it doesn't exist
  createDefaultStorageStateFile(storageStatePath);

  // Setup new API request context
  const userContext = await request.newContext();

  // Authenticate via API
  const api1 = await AuthHelper.init(userContext);
  let authResponse: APIResponse = null
  let updatedUserContext: APIRequestContext = undefined

  for(let attempt: number = 0; attempt < 2; attempt++){
    try {
      authResponse = await api1.post(username, password);
    } catch (error) {
      console.log(`Error calling endpoint POST: /auth POST for user ${username}: `, error)
    }

    if (authResponse && authResponse.ok()) {
      console.log(`Authentication for ${username} successful!`);
      const respJson = await authResponse.json();
      
      // Set up storage state and add relevant cookies and access tokens to the file.
      // We need these steps to set cookies and JN specific local storage for the logged in user.
      await userContext.storageState({ path: storageStatePath });
      setupStorageState(respJson, storageStatePath);

      // Now we need to create a new context to pass back to "log in" the user in this test and continue setup.
      // We create a new context because we haven't found an efficient way yet to directly update an existing context's storageState.
      updatedUserContext = await request.newContext({storageState: storageStatePath});
      break;

    } else if (authResponse){
      console.log(`Could not login for ${username}: Status= ${authResponse.status()}, StatusText= ${authResponse.statusText()}`);

    } else {
      console.log(`Could not login for ${username} and authResponse: ${authResponse}`);
    }
  }
  return updatedUserContext
}

export async function loginAsAdminUser(page: Page, username: string, password: string, storageStatePath: string = constants.ADMIN_STORE_PATH) {
  const adminLoginPage = new AdminPanelLoginPage(page);
  const adminPanelPage = new AdminPanelPage(page);

  // Log into Admin Panel
  await adminLoginPage.gotoWithJnAuth();
  await adminLoginPage.loginWithJNAuth(username, password);
  await adminPanelPage.resetButton.waitFor();

  // Setup Storage State based on Admin Page
  createDefaultStorageStateFile(storageStatePath);
  await page.context().storageState({ path: storageStatePath });
};


/**
 * Gets the access token stored in an API Request Context. Contexts are populated when we use a storage state we've created by
 * authenticating at the beginning of a test run in jn.setup.
 *
 * By default, .auth/defaultUser.json, but is different in any test that changes the storage state using something like this:
 *
 * &nbsp;&nbsp;_test.use({ storageState: DEFAULT_SQ_USER_AUTH });_
 *
 * API contexts can be created manually, but the playwright 'request' fixture can be used has its own browser context.
 *
 * See [Playwright Docs](https://playwright.dev/docs/api/class-apirequestcontext) for more info.
 * @param {APIRequestContext} context - The logged in API context we want to pull an access token from.
 */
export async function getContextAccessToken(context: APIRequestContext) : Promise<string> {
  let accessToken = ""
  try {
    let baseStorageState = await context.storageState();
    accessToken = baseStorageState.origins[0].localStorage[0].value;
  }
  catch (e){
    accessToken = ""
  }

  return accessToken;
}

/**
 * Gets the access token stored in a Browser Context. Contexts are populated when we use a storage state we've created by
 * authenticating at the beginning of a test run in jn.setup.
 *
 * By default, .auth/defaultUser.json, but is different in any test that changes the storage state using something like this:
 *
 * &nbsp;&nbsp;_test.use({ storageState: DEFAULT_SQ_USER_AUTH });_
 *
 * Browser contexts can be created manually, but most tests use the 'page' fixture, which has its own browser context.
 *
* See [Playwright Docs](https://playwright.dev/docs/api/class-browsercontext) for more info.
 *
 * @param {BrowserContext} context - The logged in browser context we want to pull an access token from.
 */
export async function getBrowserAccessToken(context: BrowserContext) : Promise<string> {
  let accessToken = ""
  try {
    let baseStorageState = await context.storageState();
    accessToken = baseStorageState.origins[0].localStorage[0].value;
  }
  catch (e){
    accessToken = ""
  }

  return accessToken;
}

// This is useful if we have a storageStatePath and want to read from it
export async function getStoredAccessToken(context: APIRequestContext, storageStatePath : string = undefined) : Promise<string> {
  let accessToken = ""
  try {
    // if storage state is not provided, use the context's storage state
    let baseStorageState = await context.storageState();

    if (storageStatePath) {
      baseStorageState = readStorageState(storageStatePath);
    }

    accessToken = baseStorageState.origins[0].localStorage[0].value;
  }
  catch (e){
    accessToken = ""
  }

  return accessToken;
}

export async function setAPIHeaders(context: APIRequestContext, customHeaders: APIHeader = undefined) :
Promise<APIHeader> {
  let headers: APIHeader = {};

  if (customHeaders) {
    headers = customHeaders;
  }
  else {
    const accessToken = await getStoredAccessToken(context);
    if (accessToken) {
      headers = { Authorization: `Bearer ${accessToken}` };
    }
  }
  return headers;
}

export async function setSQHeaders(context: APIRequestContext, customHeaders: APIHeader = undefined) :
Promise<APIHeader> {
  let headers: APIHeader = {};

  if (customHeaders) {
    headers = customHeaders;
  }
  else {
    const accessToken = await getStoredAccessToken(context);
    if (accessToken) {
      headers = { JwtAuthorization: `${accessToken}` };
    }
  }
  return headers;
}

// TODO: change default to a string and rename JN-41281
export function getUserToken(storageState: string = DEFAULT_USER_AUTH) {
  const defaultData = fs.readFileSync(`${storageState}`, 'utf-8');
  const defaultUser = JSON.parse(defaultData);
  return defaultUser.origins[0].localStorage[0].value
}

export function setupStorageState(respJson: Record<string, any>, storageStatePath: string) : Object {
  // Set up storage state and env variables
  const { accessToken, refreshToken, expiresIn } = respJson.data;
  // set up expiresAt in the correct format (As per our auth logic)
  let expiresAt = new Date();
  expiresAt.setSeconds(expiresAt.getSeconds() + Math.max(expiresIn, 60)); //The minimum respected value for expiresIn is 60 seconds.

  // read storageState so we can update it with local Storage
  const defaultData = fs.readFileSync(`${storageStatePath}`, 'utf-8');
  const defaultUser = JSON.parse(defaultData);

  // Set up local Storage and push to storageState file
  const origins = [];

  origins.push({
    origin: process.env.APP_STORAGE_URL,
    localStorage: [
      { name: 'accessToken', value: accessToken },
      { name: 'refreshToken', value: refreshToken },
      { name: 'tokenExpiresAt', value: expiresAt.toUTCString() },
      { name: 'expiresIn', value: expiresIn.toString() },
    ],
  });
  origins.push({
    origin: process.env.WEBAPPUI_STORAGE_URL,
    localStorage: [{ name: 'jn.auth.legacyAccessToken', value: accessToken }],
  });
  defaultUser.origins = origins;

  // Clear out cookies. We are moving away from cookies. May need to change this for auth panel tests.
  //defaultUser.cookies = [];

  // Update storage state with our changes to origins and cookies
  fs.writeFileSync(storageStatePath, JSON.stringify(defaultUser, null, 2));

  return defaultUser;
}

export function createDefaultStorageStateFile(storageStatePath: string) {
  // Create a default storageState file if one does not exist at the path
  if (!fs.existsSync(storageStatePath)) {
    console.log(`Auth File ${storageStatePath} does not exist. Creating...`);
    const defaultStorageState = {
      cookies: [],
      origins: [],
    };
    fs.writeFileSync(storageStatePath, JSON.stringify(defaultStorageState, null, 2));
  }
}

export function initializeEnvVariables(): void {
  // Read local Configuration
  const localConfig = readLocalConfig();
  const environment = process.env.ENV || 'dev';

  // set up env process.env variables
  let envUrl = '';
  let envKey = '';

  if (environment == 'prod') {
    envKey = 'prod';
    envUrl = localConfig[envKey].baseUrl;
    process.env.APP_STORAGE_URL = constants.PROD_APP_LOCAL_STORAGE_URL;
    process.env.WEBAPPUI_STORAGE_URL = constants.PROD_WEBAPPUI_LOCAL_STORAGE_URL;
  } else {
    envKey = 'dev';
    // Sets the dev url to be dev or dynamic env name
    envUrl = localConfig[envKey].baseUrl;
    const regex = /dev/;
    envUrl = `${localConfig[envKey].baseUrl}`.replace(regex, environment);
    process.env.APP_STORAGE_URL = `${constants.DEV_APP_LOCAL_STORAGE_URL}`.replace(regex, environment);
    process.env.WEBAPPUI_STORAGE_URL = `${constants.DEV_WEBAPPUI_LOCAL_STORAGE_URL}`.replace(regex, environment);
  }

  process.env.BASE_URL = envUrl;
  process.env.DEFAULT_SALES_REP_USERNAME = localConfig[envKey].username;
  process.env.USERNAME = localConfig[envKey].username;
  process.env.PASSWORD = localConfig[envKey].password;
}
