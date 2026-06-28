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
  },

  isAdult: (dateOfBirthISO: string): boolean => {
    if (!dateOfBirthISO) return false;
    const dob = new Date(dateOfBirthISO);
    if (isNaN(dob.getTime())) return false; // Invalid date
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age >= 18;
  },

  isValidUKMobile: (value: string): boolean => {
    if (!value) return false;
    const stripped = value.replace(/[\s-]/g, '');
    const regex = /^(?:0|\+44)7\d{9}$/;
    return regex.test(stripped);
  }
};
