import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';

export interface ConfirmDialogOptions {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  icon?: 'warning' | 'danger' | 'info';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss'
})
export class ConfirmDialogComponent implements OnInit {
  @Input() options: ConfirmDialogOptions = {};
  @Output() result = new EventEmitter<boolean>();
  @ViewChild('cancelBtn') cancelBtn!: ElementRef<HTMLButtonElement>;

  visible = false;

  get iconClass(): string {
    return this.options.icon === 'danger' ? 'cd-icon-wrap cd-icon-danger' : 'cd-icon-wrap cd-icon-warning';
  }

  ngOnInit() {
    // Trigger entrance animation on next tick
    requestAnimationFrame(() => { this.visible = true; });
  }

  onConfirm() {
    // Emit immediately — do NOT delay with setTimeout.
    // The service handles the exit animation + DOM cleanup after the fact.
    this.result.emit(true);
  }

  onCancel() {
    this.result.emit(false);
  }

  /** Close on Escape key */
  @HostListener('document:keydown.escape')
  onEscape() { this.onCancel(); }
}
