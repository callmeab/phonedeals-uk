export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const validate = {
  required: (value: any, fieldName: string) => {
    if (value === undefined || value === null || String(value).trim() === '') {
      throw new ValidationError(`${fieldName} is required`);
    }
  },
  
  maxLength: (value: any, max: number, fieldName: string) => {
    if (value && String(value).length > max) {
      throw new ValidationError(`${fieldName} must be less than ${max} characters`);
    }
  },

  isValidSlug: (value: string): boolean => {
    if (!value) return false;
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return slugRegex.test(value);
  }
};
