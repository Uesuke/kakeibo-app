import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/** アプリで扱うユーザー型 */
export type AppUser = 'shin' | 'saya' | 'both';

@Injectable({
  providedIn: 'root',
})
export class UserStateService {
  /** 内部状態（現在の選択ユーザー） */
  private userSubject = new BehaviorSubject<AppUser>('both');

  /** 外部公開用 Observable */
  user$ = this.userSubject.asObservable();

  /** 現在値の取得（同期アクセス用） */
  get currentUser(): AppUser {
    return this.userSubject.value;
  }

  /** ユーザー変更 */
  setUser(user: AppUser) {
    this.userSubject.next(user);
  }
}
