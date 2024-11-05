import { APIRequestContext, APIResponse } from '@playwright/test';
import { readStorageState } from '@utilities/storage-state';
import { APIHeader } from './api-header-model';

export class APIAuthHelper {
  private headers : APIHeader;

  private constructor(private context: APIRequestContext, private url: string = process.env.BASE_URL) {
    this.headers = {} // Set async during init
  }

  static async init(context: APIRequestContext, url: string = process.env.BASE_URL, customHeaders: APIHeader = undefined, storageStatePath : string = undefined) :
  Promise<APIAuthHelper> {
    const helper = new APIAuthHelper(context, url);
    const accessToken = await helper.getStoredAccessToken(storageStatePath)
    await helper.setHeaders(customHeaders, accessToken);
    return helper;
  }

  async setHeaders(customHeaders: APIHeader = undefined, accessToken: string) : Promise<void> {
    if (customHeaders) {
      this.headers = customHeaders;
    }
    else {
        this.headers = { Authorization: `Bearer ${accessToken}` };
      }
  }

  async getStoredAccessToken(storageStatePath : string = undefined) : Promise<string> {
    let accessToken = ""
    try {
      // if storage state is not provided, use the context's storage state
      let baseStorageState = await this.context.storageState();
  
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

  /* ***************************************** Base Endpoints *************************************** */
  async post(username: string, password: string): Promise<APIResponse> {
    try {
      const authResp: APIResponse = await this.context.post(`${this.url}/api/auth`, {
        data: {
          user: username,
          pass: password,
        },
      });
      return authResp
    } catch (e) {
      console.error('Error calling endpoint: /api/auth', e);
    }
  }

  async delete(): Promise<APIResponse> {
    try {
      return await this.context.delete(`${this.url}/api/auth`, {});
    } catch (e) {
      console.error('Error calling endpoint:', e);
    }
  }

  /* ***************************************** Helper Methods *************************************** */
}
