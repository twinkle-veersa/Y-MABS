import { FieldConfig } from '@shared/models';

export function formatPhoneInObj<T extends object>(obj: T, keys: string[] = []) {
  Object.entries(obj).forEach(([k, v]) => {
    if (PHONE_FAX_KEYS.includes(k) || keys.includes(k)) {
      if (v !== null && (typeof v === 'string' || typeof v === 'number')) {
        Object.assign(obj, { [k]: formatPhone(v.toString()) || null });
      }
    }
  });
  return obj;
}

export const formatPhone = (v: string): string =>
  v?.toString().replace(/^(\d{0,3})(\d{0,3})(\d{0,4})/, '($1) $2-$3') ?? '';

export const formatDate = (v: Date): string =>
  (v.getMonth() + 1).toString().padStart(2, '0') +
  v.getDate().toString().padStart(2, '0') +
  v.getFullYear();

export const formatTaxId = (v: string): string =>
  v?.toString().replace(/^(\d{0,3})(\d{0,2})(\d{0,4})/, '$1-$2-$3') ?? '';

export function sanitizePhone(input: string): string {
  return input?.replace(/\D/g, '') ?? '';
}

export function sanitizeArrayResponse<T>(payload: T): T {
  return Boolean(payload) && Array.isArray(payload) ? payload : ([] as T);
}

export function sanitizeObj<T extends object>(obj: T, keys: string[] = []) {
  Object.entries(obj).forEach(([k, v]) => {
    if (PHONE_FAX_KEYS.includes(k) || keys.includes(k)) {
      Object.assign(obj, { [k]: sanitizePhone(v) || null });
    }
  });
  return obj;
}

export function groupedIntoOne<T extends Record<string, FieldConfig[]>>(obj: T) {
  return Object.entries(obj).flatMap(([position, value]) =>
    value.map(x => {
      return { ...x, position };
    })
  );
}

export function convertToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64String = reader.result as string;
      resolve(base64String);
    };
    reader.onerror = error => reject(error);
  });
}

const PHONE_FAX_KEYS = ['Phone', 'phone', 'Fax', 'fax'];
