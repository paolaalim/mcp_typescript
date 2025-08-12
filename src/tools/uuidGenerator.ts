import { v4 as uuidv4 } from 'uuid';


export interface GenerateUuidArgs {
  count?: number;
  format?: 'formatted' | 'raw';
}

// Gera um ou mais UUIDs 
export function generateUuids(options: GenerateUuidArgs = {}): string[] {
  const { count = 1, format = 'formatted' } = options;
  const uuids: string[] = [];

  for (let i = 0; i < count; i++) {
    const newUuid = uuidv4();
    uuids.push(format === 'raw' ? newUuid.replace(/-/g, '') : newUuid);
  }

  return uuids;
}
