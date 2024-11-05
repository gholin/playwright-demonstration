import * as fs from 'fs';

export function readStorageState(storageStatePath: string) {
    const stateJson = JSON.parse(fs.readFileSync(`${storageStatePath}`, 'utf-8'));
    return stateJson;
}
