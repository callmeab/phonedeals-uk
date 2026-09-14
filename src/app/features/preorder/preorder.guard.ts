import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';

/**
 * Interface the Iphone18PreorderComponent implements to expose its unsaved-changes state.
 */
export interface CanDeactivatePreorder {
  hasUnsavedChanges: () => boolean;
}

/**
 * Functional CanDeactivate guard for the Pre-Booking Wizard.
 *
 * Shows a professional styled modal dialog (instead of native window.confirm)
 * if the user has unsaved changes — mirrors checkoutGuard exactly.
 */
export const preorderGuard: CanDeactivateFn<CanDeactivatePreorder> = (component) => {
  if (component.hasUnsavedChanges && component.hasUnsavedChanges()) {
    const dialogService = inject(ConfirmDialogService);
    return dialogService.confirm({
      icon:        'warning',
      title:       'Leave Pre-Booking?',
      message:     'You\'re in the middle of reserving your iPhone 18 Pro. If you leave now, all the details you\'ve entered will be lost.',
      confirmText: 'Leave Page',
      cancelText:  'Stay Here'
    });
  }
  return true;
};
