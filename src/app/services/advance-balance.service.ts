import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * AdvanceBalance テーブルのレスポンス型
 *
 * balance の意味：
 *   正 → saya が shin に借りている
 *   負 → shin が saya に借りている
 *   0 → 精算済み
 */
export interface AdvanceBalance {
  balance: number;
  updatedAt: string;
}

/**
 * 画面表示用の整形済み型
 */
export interface AdvanceBalanceView {
  debtor: 'shin' | 'saya' | null;
  creditor: 'shin' | 'saya' | null;
  amount: number;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdvanceBalanceService {
  private http = inject(HttpClient);

  /**
   * API Gateway
   * 既存 events API と同一ベースURLを使用
   */
  private baseUrl = `${environment.apiBaseUrl}/advance-balance`;

  /**
   * 残高取得（生データ）
   */
  getBalance(): Observable<AdvanceBalance> {
    return this.http.get<AdvanceBalance>(this.baseUrl).pipe(
      catchError((error) => {
        console.error('[AdvanceBalance] API Error:', error);
        return throwError(() => error);
      }),
    );
  }

  /**
   * UI表示用に整形して返す
   *
   * Angularコンポーネントはこのメソッドだけ使えばOK
   */
  getBalanceView(): Observable<AdvanceBalanceView> {
    return new Observable((observer) => {
      this.getBalance().subscribe({
        next: (data) => {
          observer.next(this.toViewModel(data));
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }

  /**
   * 表示用に変換
   */
  private toViewModel(data: AdvanceBalance): AdvanceBalanceView {
    const value = data.balance ?? 0;

    if (value === 0) {
      return {
        debtor: null,
        creditor: null,
        amount: 0,
        updatedAt: data.updatedAt,
      };
    }

    if (value > 0) {
      return {
        debtor: 'saya',
        creditor: 'shin',
        amount: value,
        updatedAt: data.updatedAt,
      };
    }

    return {
      debtor: 'shin',
      creditor: 'saya',
      amount: Math.abs(value),
      updatedAt: data.updatedAt,
    };
  }
}
