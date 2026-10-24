import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Book } from '../core/models';
import { BookService, BorrowService, ToastService } from '../core/api';
@Component({ standalone: true, imports: [FormsModule], template: `
<h1>Explore books</h1><p style="color:var(--muted)">Find your next great read.</p>
<div style="display:flex;gap:12px;flex-wrap:wrap;margin:20px 0">
 <input class="input" style="flex:2;min-width:220px" placeholder="Search by title, author or ISBN" [ngModel]="kw()" (ngModelChange)="kw.set($event)" aria-label="Search books">
 <select class="input" style="flex:1;min-width:150px" [ngModel]="cat()" (ngModelChange)="cat.set($event)" aria-label="Category"><option value="">All categories</option>@for (c of cats(); track c) { <option>{{c}}</option> }</select>
 <select class="input" style="flex:1;min-width:150px" [ngModel]="sort()" (ngModelChange)="sort.set($event)" aria-label="Sort"><option value="title">Title A–Z</option><option value="author">Author A–Z</option><option value="avail">Most available</option></select>
 <label style="display:flex;align-items:center;gap:6px;margin:0"><input type="checkbox" [ngModel]="onlyAvail()" (ngModelChange)="onlyAvail.set($event)"> Available only</label></div>
@if (loading()) { <div class="grid">@for (i of [1,2,3,4]; track i) { <div class="skeleton" style="height:340px"></div> }</div> }
@else if (shown().length === 0) { <div class="empty card"><strong>No books found.</strong><br>Try changing your search or filters.</div> }
@else { <div class="grid">@for (b of shown(); track b.id) { <article class="card" style="padding:0;overflow:hidden">
  @if (img(b)) { <img [src]="img(b)!" [alt]="'Cover of ' + b.title" style="width:100%;aspect-ratio:2/3;object-fit:cover;display:block"> }
  @else { <div class="ph" [attr.aria-label]="'No cover for ' + b.title"><span>{{b.title}}</span></div> }
  <div style="padding:14px"><h3 style="font-size:17px">{{b.title}}</h3><div style="color:var(--muted);font-size:14px">{{b.author}}</div>
   <div style="margin:10px 0;display:flex;gap:6px;flex-wrap:wrap"><span class="badge b-info">{{b.category}}</span>
    <span class="badge" [class.b-ok]="b.availableCopies>0" [class.b-bad]="b.availableCopies===0">{{b.availableCopies>0?b.availableCopies+' available':'Unavailable'}}</span></div>
   <button class="btn" style="width:100%" [disabled]="b.availableCopies===0" (click)="confirm.set(b)">{{b.availableCopies>0?'Borrow':'Currently unavailable'}}</button></div></article> }</div> }
@if (confirm(); as b) { <div role="dialog" aria-modal="true" aria-labelledby="bt" style="position:fixed;inset:0;background:rgba(15,23,41,.5);display:grid;place-items:center;z-index:40">
 <div class="card" style="width:min(420px,92vw)"><h2 id="bt">Borrow this book?</h2><p><strong>{{b.title}}</strong><br>You will have 14 days to return this book.<br>Due date: <strong>{{due()}}</strong></p>
 <div style="display:flex;justify-content:flex-end;gap:8px"><button class="btn ghost" (click)="confirm.set(null)">Cancel</button><button class="btn" [disabled]="busy()" (click)="borrow(b)">Confirm borrow</button></div></div></div> }`,
 styles: [`.ph{aspect-ratio:2/3;background:linear-gradient(160deg,#27315a,#4f46e5);color:#fff;display:grid;place-items:center;padding:20px;text-align:center;font:600 18px Fraunces}`] })
export class CatalogComponent implements OnInit {
  private books = inject(BookService); private borrows = inject(BorrowService); private toast = inject(ToastService);
  all = signal<Book[]>([]); loading = signal(true); kw = signal(''); cat = signal(''); sort = signal('title'); onlyAvail = signal(false);
  confirm = signal<Book | null>(null); busy = signal(false);
  cats = computed(() => [...new Set(this.all().map(b => b.category))].sort());
  shown = computed(() => {
    const k = this.kw().toLowerCase(), s = this.sort();
    return this.all().filter(b => (!k || (b.title + b.author + b.isbn).toLowerCase().includes(k)) && (!this.cat() || b.category === this.cat()) && (!this.onlyAvail() || b.availableCopies > 0))
      .sort((a, b) => s === 'avail' ? b.availableCopies - a.availableCopies : (s === 'author' ? a.author : a.title).localeCompare(s === 'author' ? b.author : b.title));
  });
  img(b: Book) { return this.books.cover(b.coverImageUrl); }
  due() { const d = new Date(); d.setDate(d.getDate() + 14); return d.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }); }
  ngOnInit() { this.load(); }
  load() { this.books.list().subscribe({ next: b => { this.all.set(b); this.loading.set(false); }, error: () => { this.loading.set(false); this.toast.show('Could not load books.', 'bad'); } }); }
  borrow(b: Book) { this.busy.set(true); this.borrows.borrow(b.id).subscribe({
    next: () => { this.toast.show('Book borrowed successfully.'); this.confirm.set(null); this.busy.set(false); this.load(); },
    error: e => { this.toast.show(e.error?.message ?? 'Could not borrow this book.', 'bad'); this.busy.set(false); this.confirm.set(null); } }); }
}
