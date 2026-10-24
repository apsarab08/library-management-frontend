import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/api';
@Component({ standalone: true, imports: [RouterOutlet, RouterLink, RouterLinkActive], template: `
<div style="display:flex;min-height:100vh">
 <nav [style.display]="open()?'flex':''" class="side" aria-label="Main">
  <div style="font:700 22px Fraunces;color:#fff;padding:8px 12px 24px">LibraHub</div>
  <a routerLink="/books" routerLinkActive="on">{{auth.isAdmin()?'Books':'Browse books'}}</a>
  <a routerLink="/my-borrowings" routerLinkActive="on">My borrowings</a>
  @if (auth.isAdmin()) { <a routerLink="/fine-settings" routerLinkActive="on">Fine settings</a> }
  <button class="out" (click)="auth.logout()">Log out</button>
 </nav>
 <div style="flex:1;min-width:0"><header style="display:flex;justify-content:space-between;align-items:center;padding:14px 28px;background:#fff;border-bottom:1px solid var(--line)">
  <button class="btn ghost menu" (click)="open.set(!open())" aria-label="Toggle navigation">Menu</button>
  <span style="margin-left:auto"><strong>{{auth.user()?.name}}</strong> <span class="badge b-info">{{auth.user()?.role}}</span></span></header>
  <main style="padding:28px;max-width:1200px"><router-outlet/></main></div></div>`,
 styles: [`.side{width:240px;background:var(--navy);padding:20px 12px;flex-direction:column;gap:4px;display:flex}.side a{color:#b7c0d6;padding:10px 12px;border-radius:10px;text-decoration:none}.side a:hover{background:var(--navy2)}.side a.on{background:var(--accent);color:#fff}.out{margin-top:auto;background:none;border:0;color:#b7c0d6;text-align:left;padding:10px 12px;cursor:pointer}
 .menu{display:none}@media(max-width:800px){.side{display:none;position:fixed;inset:0 40% 0 0;z-index:20}.menu{display:inline-block}}`] })
export class ShellComponent { auth = inject(AuthService); open = signal(false); }
