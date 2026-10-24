import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastService } from './core/api';
@Component({ selector: 'app-root', standalone: true, imports: [RouterOutlet], template: `
<router-outlet/>
<div style="position:fixed;right:20px;bottom:20px;display:grid;gap:8px;z-index:50" aria-live="polite">
 @for (t of toast.items(); track t.id) { <div class="card" [style.border-left]="'4px solid ' + (t.kind==='ok'?'var(--ok)':'var(--bad)')">{{t.msg}}</div> }
</div>` })
export class AppComponent { toast = inject(ToastService); }
