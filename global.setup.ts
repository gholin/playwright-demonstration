import { initializeEnvVariables } from '@lib/helpers/auth-helpers';

export default function setup() : void {
  // read local config and initialize Global Environment variables
  initializeEnvVariables();
}
