
import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormControl,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { AdminService, ToastService } from '../core/api';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <h1>Fine settings</h1>

    <p style="color:var(--muted)">
      Changes apply to future returns only. Existing fines keep their amount.
    </p>

    <form
      class="card"
      style="max-width:440px;margin-top:20px"
      (ngSubmit)="save()"
    >
      <h3>Library fine policy</h3>

      <p style="color:var(--muted);margin:8px 0 0">
        Current rate
      </p>

      <div style="font:700 32px Fraunces">
        ₹{{ rate() }}
        <small style="font:14px Inter;color:var(--muted)">/ day</small>
      </div>

      <div class="field" style="margin-top:16px">
        <label for="r">New rate (₹ per day)</label>

        <input
          id="r"
          class="input"
          type="number"
          step="0.5"
          min="0"
          [formControl]="c"
        />

        @if (c.touched && c.invalid) {
          <div class="err">
            Enter an amount of 0 or more.
          </div>
        }
      </div>

      <button
        type="button"
        class="btn"
        (click)="save()"
      >
        Test Save
      </button>

      <button
        type="submit"
        class="btn"
        [disabled]="c.invalid"
      >
        Save changes
      </button>
    </form>
  `
})
export class FineSettingsComponent implements OnInit {
  private admin = inject(AdminService);
  private toast = inject(ToastService);

  rate = signal(0);

  c = new FormControl<number | null>(null, [
    Validators.required,
    Validators.min(0)
  ]);

  ngOnInit(): void {
    this.admin.getRate().subscribe({
      next: r => {
        console.log('GET response:', r);
        this.rate.set(r.finePerDay);
      },
      error: e => {
        console.error('Failed to load fine rate:', e);
      }
    });
  }

  save(): void {
    console.log('Save clicked');
    console.log('Entered rate:', this.c.value);

    if (this.c.invalid || this.c.value === null) {
      this.c.markAsTouched();
      console.log('Invalid input:', this.c.errors);
      return;
    }

    console.log('Sending PUT request...');

    this.admin.setRate(this.c.value).subscribe({
      next: r => {
        console.log('PUT response:', r);

        this.rate.set(r.finePerDay);
        this.c.reset();

        this.toast.show('Fine policy updated successfully.');
      },
      error: e => {
        console.error('Save failed:', e);

        this.toast.show(
          e.error?.errors?.finePerDay ??
          e.error?.message ??
          'Could not save.',
          'bad'
        );
      }
    });
  }
}
