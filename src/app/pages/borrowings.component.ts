import { Component, inject, OnInit, signal } from '@angular/core';
import { Borrow } from '../core/models';
import { BookService, BorrowService, ToastService } from '../core/api';
@Component({ standalone: true, template: `
<h1>My borrowings</h1><p style="color:var(--muted)">Books you currently have out.</p>
@if (loading()) { <div class="skeleton" style="height:120px;margin-top:20px"></div> }
@else if (!rows().length) { <div class="card empty" style="margin-top:20px"><strong>Nothing borrowed yet.</strong><br>Browse the catalog to pick your next read.</div> }
@else { <div class="card tablewrap" style="margin-top:20px"><table><thead><tr><th>Book</th><th>Borrowed</th><th>Due</th><th>Remaining</th><th>Status</th><th></th></tr></thead><tbody>
 @for (r of rows(); track r.id) { <tr><td><div style="display:flex;gap:12px;align-items:center">
   @if (img(r)) { <img [src]="img(r)!" alt="" style="width:40px;height:56px;object-fit:cover;border-radius:4px"> } @else { <div style="width:40px;height:56px;border-radius:4px;background:var(--navy2)"></div> }
   <div><strong>{{r.bookTitle}}</strong><div style="color:var(--muted);font-size:13px">{{r.bookAuthor}}</div></div></div></td>
  <td>{{r.borrowedDate}}</td><td>{{r.dueDate}}</td><td>{{r.status==='OVERDUE'?r.overdueDays+' days late':r.daysRemaining+' days'}}</td>
  <td><span class="badge" [class.b-bad]="r.status==='OVERDUE'" [class.b-warn]="r.status==='BORROWED'&&r.daysRemaining<=3" [class.b-ok]="r.status==='BORROWED'&&r.daysRemaining>3">{{r.status==='OVERDUE'?'Overdue':(r.daysRemaining<=3?'Due soon':'Borrowed')}}</span></td>
  <td><button class="btn ghost" (click)="target.set(r)">Return</button></td></tr> }</tbody></table></div> }
@if (target(); as r) { <div role="dialog" aria-modal="true" style="position:fixed;inset:0;background:rgba(15,23,41,.5);display:grid;place-items:center;z-index:40"><div class="card" style="width:min(420px,92vw)">
 <h2>Return this book?</h2><p><strong>{{r.bookTitle}}</strong></p>
 @if (r.status==='OVERDUE') { <p class="err" style="font-size:15px">This book is overdue.<br>Overdue by: {{r.overdueDays}} days<br>The fine is calculated at return using the current library rate.</p> }
 <div style="display:flex;justify-content:flex-end;gap:8px"><button class="btn ghost" (click)="target.set(null)">Cancel</button><button class="btn" (click)="ret(r)">Confirm return</button></div></div></div> }` })
export class BorrowingsComponent implements OnInit {
  private svc = inject(BorrowService); private books = inject(BookService); private toast = inject(ToastService);
  rows = signal<Borrow[]>([]); loading = signal(true); target = signal<Borrow | null>(null);
  img(r: Borrow) { return this.books.cover(r.coverImageUrl); }
  ngOnInit() { this.load(); }
  load() { this.svc.mine().subscribe({ next: r => { this.rows.set(r); this.loading.set(false); }, error: () => this.loading.set(false) }); }
  ret(r: Borrow) { this.svc.giveBack(r.id).subscribe({ next: x => { this.toast.show(x.fineAmount > 0 ? `Book returned. Fine: ₹${x.fineAmount}` : 'Book returned successfully.'); this.target.set(null); this.load(); }, error: e => this.toast.show(e.error?.message ?? 'Could not return book.', 'bad') }); }
}
