// API Helper Pattern
import { APIRequestContext, APIResponse } from '@playwright/test';
import { setAPIHeaders } from '@helpers/auth-helpers';
import { APIHeader } from '@lib/models/api-header-model';

export class AuthHelper {
  private headers : APIHeader;

  private constructor(private context: APIRequestContext, private url: string = process.env.BASE_URL) {
    this.headers = {} // Set async during init
  }

  static async init(context: APIRequestContext, url: string = process.env.BASE_URL, customHeaders: APIHeader = undefined) :
  Promise<AuthHelper> {
    const helper = new AuthHelper(context, url);
    await helper.setHeaders(customHeaders);
    return helper;
  }

  async setHeaders(customHeaders: APIHeader = undefined) : Promise<void> {
    this.headers = await setAPIHeaders(this.context, customHeaders);
  }

  /* ***************************************** Base Endpoints *************************************** */
  async post(username: string, password: string) : Promise<APIResponse> {
    try {
      const authResp: APIResponse = await this.context.post(`${this.url}/auth`, {
        data: {
          user: username,
          pass: password,
        },
      });
      return authResp
    } catch (e) {
      console.error('Error calling endpoint: /auth', e);
    }
  }
  async delete() : Promise<APIResponse> {
    try {
      return await this.context.delete(`${this.url}/auth`, {});
    } catch (e) {
      console.error('Error calling endpoint:', e);
    }
  }

  async postRefresh(payload : Object = {}) : Promise<APIResponse> {
    try {
      return await this.context.post(`${this.url}/auth/refresh`, {
        data: payload,
        headers: this.headers,
      });
    } catch (e) {
      console.error('Error calling endpoint:', e);
    }
  }

  async getPing(queryParams: string = '?web=yes') : Promise<APIResponse> {
    try {
      return await this.context.get(`${this.url}/auth/ping${queryParams}`, {
        headers: this.headers,
      });
    } catch (e) {
      console.error('Error calling endpoint:', e);
    }
  }

  async getCookie() : Promise<APIResponse> {
    try {
      return await this.context.get(`${this.url}/auth/cookie`, {
        headers: this.headers,
      });
    } catch (e) {
      console.error('Error calling endpoint:', e);
    }
  }

  /* ***************************************** Helper Methods *************************************** */
}
