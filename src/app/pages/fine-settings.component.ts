import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService, ToastService } from '../core/api';
@Component({ standalone: true, imports: [ReactiveFormsModule], template: `
<h1>Fine settings</h1><p style="color:var(--muted)">Changes apply to future returns only. Existing fines keep their amount.</p>
<form class="card" style="max-width:440px;margin-top:20px" (ngSubmit)="save()"><h3>Library fine policy</h3>
 <p style="color:var(--muted);margin:8px 0 0">Current rate</p><div style="font:700 32px Fraunces">₹{{rate()}} <small style="font:14px Inter;color:var(--muted)">/ day</small></div>
 <div class="field" style="margin-top:16px"><label for="r">New rate (₹ per day)</label><input id="r" class="input" type="number" step="0.5" min="0" [formControl]="c">
  @if (c.touched && c.invalid) { <div class="err">Enter an amount of 0 or more.</div> }</div>
 <button class="btn" [disabled]="c.invalid">Save changes</button></form>` })
export class FineSettingsComponent implements OnInit {
  private admin = inject(AdminService); private toast = inject(ToastService);
  rate = signal(0); c = new FormControl<number | null>(null, [Validators.required, Validators.min(0)]);
  ngOnInit() { this.admin.getRate().subscribe(r => this.rate.set(r.finePerDay)); }
  save() { this.admin.setRate(this.c.value!).subscribe({ next: r => { this.rate.set(r.finePerDay); this.c.reset(); this.toast.show('Fine policy updated successfully.'); }, error: e => this.toast.show(e.error?.errors?.finePerDay ?? e.error?.message ?? 'Could not save.', 'bad') }); }
}
