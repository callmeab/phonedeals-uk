import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// ── UK Phone Number Validator ───────────────────────────────────────────────
// Accepts: 07xxxxxxxxx or +447xxxxxxxxx (with optional spaces)

export function ukPhoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const isValid = /^(\+44\s?7|07)\d{9}$/.test(control.value.replace(/\s+/g, ''));
    return isValid ? null : { invalidUkPhone: true };
  };
}

// ── UK Sort Code Validator ──────────────────────────────────────────────────
// Format: XX-XX-XX (e.g. 20-30-40)

export function sortCodeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const isValid = /^[0-9]{2}-[0-9]{2}-[0-9]{2}$/.test(control.value);
    return isValid ? null : { invalidSortCode: true };
  };
}

// ── UK Bank Account Number Validator ────────────────────────────────────────
// Must be exactly 8 digits

export function accountNumberValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const isValid = /^[0-9]{8}$/.test(control.value);
    return isValid ? null : { invalidAccountNumber: true };
  };
}

// ── Age Validator ───────────────────────────────────────────────────────────
// Checks that the date-of-birth control value represents a person >= minAge

export function ageValidator(minAge: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const dob = new Date(control.value);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age >= minAge ? null : { minAge: { requiredAge: minAge, actualAge: age } };
  };
}
