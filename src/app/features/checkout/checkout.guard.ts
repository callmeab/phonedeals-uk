import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { Observable } from 'rxjs';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';

/**
 * Interface the CheckoutComponent implements to expose its unsaved-changes state.
 */
export interface CanDeactivateCheckout {
  hasUnsavedChanges: () => boolean | Observable<boolean>;
}

/**
 * Functional CanDeactivate guard for the Checkout Wizard.
 *
 * Shows a professional styled modal dialog (instead of native window.confirm)
 * if the user has unsaved changes.
 *
 * - Returns Promise<true>  → navigation is allowed (user clicked "Leave Page")
 * - Returns Promise<false> → navigation is blocked (user clicked "Stay Here")
 */
export const checkoutGuard: CanDeactivateFn<CanDeactivateCheckout> = (component) => {
  if (component.hasUnsavedChanges && component.hasUnsavedChanges()) {
    const dialogService = inject(ConfirmDialogService);
    return dialogService.confirm({
      icon:        'warning',
      title:       'Leave Checkout?',
      message:     'You\'re in the middle of placing an order. If you leave now, all the details you\'ve entered will be lost.',
      confirmText: 'Leave Page',
      cancelText:  'Stay Here'
    });
  }
  return true;
};
