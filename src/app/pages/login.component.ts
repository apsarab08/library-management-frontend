import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/api';
@Component({ standalone: true, imports: [ReactiveFormsModule, RouterLink], template: `
<main style="min-height:100vh;display:grid;grid-template-columns:1fr 1fr">
 <section style="background:var(--navy);color:#fff;padding:56px;display:flex;flex-direction:column;justify-content:space-between">
  <div style="font:700 24px Fraunces">LibraHub</div>
  <div><h1 style="font-size:44px;max-width:14ch">Every shelf, one quiet place.</h1><p style="color:#a9b2c8;max-width:38ch">Borrow, return and keep track of fines without the paperwork.</p></div><small style="color:#7a859f">Library management, made calm.</small>
 </section>
 <section style="display:grid;place-items:center;padding:24px"><form class="card" style="width:min(400px,100%)" [formGroup]="f" (ngSubmit)="go()">
  <h2>{{reg?'Create your account':'Welcome back'}}</h2><p style="color:var(--muted)">{{reg?'Join LibraHub to start borrowing.':'Sign in to continue.'}}</p>
  @if (reg) { <div class="field"><label for="n">Full name</label><input id="n" class="input" formControlName="name">
   @if (f.get('name')?.touched && f.get('name')?.invalid) { <div class="err">Enter your name (2+ characters).</div> }</div> }
  <div class="field"><label for="e">Email</label><input id="e" class="input" type="email" formControlName="email">
   @if (f.get('email')?.touched && f.get('email')?.invalid) { <div class="err">Enter a valid email address.</div> }</div>
  <div class="field"><label for="p">Password</label><div style="position:relative"><input id="p" class="input" [type]="show()?'text':'password'" formControlName="password">
   <button type="button" class="btn ghost" style="position:absolute;right:4px;top:4px;padding:6px 10px" (click)="show.set(!show())" [attr.aria-label]="show()?'Hide password':'Show password'">{{show()?'Hide':'Show'}}</button></div>
   @if (f.get('password')?.touched && f.get('password')?.invalid) { <div class="err">Password must be at least 6 characters.</div> }</div>
  @if (error()) { <div class="err" role="alert" style="margin-bottom:12px">{{error()}}</div> }
  <button class="btn" style="width:100%" [disabled]="loading()">{{loading()?'Please wait…':(reg?'Create account':'Sign in')}}</button>
  <p style="text-align:center;font-size:14px">@if (reg) { Have an account? <a routerLink="/login">Sign in</a> } @else { New here? <a routerLink="/register">Create an account</a> }</p>
 </form></section></main>` })
export class LoginComponent {
  private fb = inject(FormBuilder); private auth = inject(AuthService); private router = inject(Router);
  reg = !!inject(ActivatedRoute).snapshot.data['register']; show = signal(false); loading = signal(false); error = signal('');
  f = this.fb.nonNullable.group({ name: [''], email: ['', [Validators.required, Validators.email]], password: ['', [Validators.required, Validators.minLength(6)]] });
  constructor() { if (this.reg) this.f.controls.name.addValidators([Validators.required, Validators.minLength(2)]); }
  go() {
    if (this.f.invalid) { this.f.markAllAsTouched(); return; }
    this.loading.set(true); this.error.set(''); const v = this.f.getRawValue();
    const req = this.reg ? this.auth.register(v) : this.auth.login({ email: v.email, password: v.password });
    req.subscribe({ next: () => this.router.navigate(['/']), error: e => { this.error.set(e.error?.message ?? 'Could not reach the server.'); this.loading.set(false); } });
  }
}
