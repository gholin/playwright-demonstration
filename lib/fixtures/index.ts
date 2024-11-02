import { mergeTests, mergeExpects } from '@playwright/test';
import { expect as expectPlaywright } from '@playwright/test';
import { test as testPlaywright } from '@playwright/test';

// This is currently set up to add test from Playwright until we have fixtures to extend
// so we only need one import statement for test and expect since we're extending test.
export const test = mergeTests( testPlaywright);

// This is currently set up to add expect from Playwright 
export const expect = mergeExpects(expectPlaywright);
