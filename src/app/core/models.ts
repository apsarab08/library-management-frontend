export interface Book{id:number;title:string;author:string;isbn:string;category:string;description:string;totalCopies:number;availableCopies:number;coverImageUrl:string|null}
export interface Borrow{id:number;bookId:number;bookTitle:string;bookAuthor:string;coverImageUrl:string|null;userName:string;userEmail:string;borrowedDate:string;dueDate:string;returnedDate:string|null;status:'BORROWED'|'RETURNED'|'OVERDUE';daysRemaining:number;overdueDays:number;fineAmount:number;finePaid:boolean}
export interface Auth{token:string;id:number;name:string;email:string;role:'ADMIN'|'USER'}
