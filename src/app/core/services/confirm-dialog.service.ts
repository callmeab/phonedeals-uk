import {
  ApplicationRef,
  ComponentRef,
  EnvironmentInjector,
  Injectable,
  NgZone,
  createComponent
} from '@angular/core';
import {
  ConfirmDialogComponent,
  ConfirmDialogOptions
} from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  constructor(
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector,
    private ngZone: NgZone
  ) {}

  /**
   * Opens a styled modal confirm dialog.
   * Returns a Promise<boolean>:
   *  - true  → user confirmed (Leave Page) → router proceeds
   *  - false → user cancelled (Stay Here)  → router stays
   *
   * Key design: the Promise resolves IMMEDIATELY when the user clicks,
   * so the Angular router never times out waiting for the guard.
   * The exit animation and DOM cleanup happen separately afterwards.
   */
  confirm(options: ConfirmDialogOptions = {}): Promise<boolean> {
    const defaults: Required<ConfirmDialogOptions> = {
      title:       'Leave Checkout?',
      message:     'If you go back or leave this page, all the information you\'ve filled in will be lost and you\'ll have to start again.',
      confirmText: 'Yes, Leave Page',
      cancelText:  'No, Stay Here',
      icon:        'warning'
    };

    const merged = { ...defaults, ...options };

    return new Promise<boolean>((resolve) => {
      // ── 1. Create a host <div> and mount it to <body>
      const hostEl = document.createElement('div');
      document.body.appendChild(hostEl);

      // ── 2. Dynamically instantiate the dialog component
      const compRef: ComponentRef<ConfirmDialogComponent> = createComponent(
        ConfirmDialogComponent,
        { environmentInjector: this.injector, hostElement: hostEl }
      );
      compRef.setInput('options', merged);

      // ── 3. Register with Angular's change detection
      this.appRef.attachView(compRef.hostView);

      // ── 4. Helper: play exit animation then destroy
      const destroy = () => {
        // Trigger exit animation
        compRef.instance.visible = false;
        compRef.changeDetectorRef.detectChanges();

        // Remove from DOM after animation completes
        setTimeout(() => {
          this.appRef.detachView(compRef.hostView);
          compRef.destroy();
          if (document.body.contains(hostEl)) {
            document.body.removeChild(hostEl);
          }
        }, 300);
      };

      // ── 5. Subscribe to result — resolve IMMEDIATELY, animate out after
      const sub = compRef.instance.result.subscribe((confirmed: boolean) => {
        sub.unsubscribe();

        // Resolve the Promise synchronously inside Angular's zone so the
        // router immediately continues or cancels the navigation.
        this.ngZone.run(() => resolve(confirmed));

        // Exit animation runs in parallel (does NOT block resolution)
        destroy();
      });
    });
  }
}
