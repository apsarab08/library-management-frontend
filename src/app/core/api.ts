import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { Auth, Book, Borrow } from './models';
export const API = 'http://localhost:8080';
@Injectable({providedIn:'root'})
export class AuthService {
  private http=inject(HttpClient); private router=inject(Router);
  user=signal<Auth|null>(JSON.parse(localStorage.getItem('lh_user')||'null'));
  get token(){return this.user()?.token??null}
  isAdmin(){return this.user()?.role==='ADMIN'}
  login(b:{email:string;password:string}){return this.http.post<Auth>(`${API}/api/auth/login`,b).pipe(tap(u=>this.set(u)))}
  register(b:{name:string;email:string;password:string}){return this.http.post<Auth>(`${API}/api/auth/register`,b).pipe(tap(u=>this.set(u)))}
  private set(u:Auth){localStorage.setItem('lh_user',JSON.stringify(u));this.user.set(u)}
  logout(){localStorage.removeItem('lh_user');this.user.set(null);this.router.navigate(['/login'])}
}
@Injectable({providedIn:'root'})
export class BookService {
  private http=inject(HttpClient);
  list(kw=''){return this.http.get<Book[]>(`${API}/api/books/search`,{params:{keyword:kw}})}
  get(id:number){return this.http.get<Book>(`${API}/api/books/${id}`)}
  save(b:Partial<Book>,id?:number){return id?this.http.put<Book>(`${API}/api/books/${id}`,b):this.http.post<Book>(`${API}/api/books`,b)}
  remove(id:number){return this.http.delete<void>(`${API}/api/books/${id}`)}
  upload(id:number,f:File){const d=new FormData();d.append('file',f);return this.http.post<Book>(`${API}/api/books/${id}/image`,d)}
  removeImage(id:number){return this.http.delete<Book>(`${API}/api/books/${id}/image`)}
  cover(u:string|null){return u?API+u:null}
}
@Injectable({providedIn:'root'})
export class BorrowService {
  private http=inject(HttpClient);
  borrow(id:number){return this.http.post<Borrow>(`${API}/api/borrow/${id}`,{})}
  giveBack(id:number){return this.http.put<Borrow>(`${API}/api/borrow/${id}/return`,{})}
  mine(){return this.http.get<Borrow[]>(`${API}/api/borrow/my-books`)}
  history(){return this.http.get<Borrow[]>(`${API}/api/borrow/history`)}
  fines(){return this.http.get<Borrow[]>(`${API}/api/borrow/my-fines`)}
}
@Injectable({providedIn:'root'})
export class AdminService {
  private http=inject(HttpClient);
  users(){return this.http.get<any[]>(`${API}/api/admin/users`)}
  records(){return this.http.get<Borrow[]>(`${API}/api/admin/borrow-records`)}
  dashboard(){return this.http.get<any>(`${API}/api/admin/dashboard`)}
  fines(kind:''|'pending'|'paid'=''){return this.http.get<Borrow[]>(`${API}/api/admin/fines${kind?'/'+kind:''}`)}
  pay(id:number){return this.http.put<Borrow>(`${API}/api/admin/fines/${id}/pay`,{})}
  getRate(){return this.http.get<{finePerDay:number}>(`${API}/api/admin/settings/fine`)}
  setRate(finePerDay:number){return this.http.put<{finePerDay:number}>(`${API}/api/admin/settings/fine`,{finePerDay})}
}
@Injectable({providedIn:'root'})
export class ToastService {
  items=signal<{id:number;msg:string;kind:'ok'|'bad'}[]>([]);
  show(msg:string,kind:'ok'|'bad'='ok'){const id=Date.now();this.items.update(a=>[...a,{id,msg,kind}]);setTimeout(()=>this.items.update(a=>a.filter(t=>t.id!==id)),3500)}
}
