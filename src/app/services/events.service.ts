import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * 家計簿イベントの型定義
 * API（Lambda + DynamoDB）のレスポンス構造に対応
 */
export interface Event {
  eventId: string;
  date: string;
  amount: number;
  isCredit: number;
  isIncome: boolean;
  tagId?: string | null;
  title?: string;
  userName: string;
}

@Injectable({
  providedIn: 'root',
})
export class EventsService {
  /**
   * API Gateway のベースURL
   * environment によって dev / prod を切り替える
   */
  private baseUrl = `${environment.apiBaseUrl}/events`;

  constructor(private http: HttpClient) {}

  /**
   * イベント一覧取得（月別）
   *
   * - 非同期で Lambda API を呼び出す
   * - Observable を返し、subscribe は呼び出し元に委譲
   * - エラーは catchError で拾い、上位に通知する
   */
  getEvents(userName: string, month: string): Observable<Event[]> {
    const params = new HttpParams().set('userName', userName).set('month', month);

    return this.http.get<Event[]>(this.baseUrl, { params }).pipe(
      /**
       * API エラー時の共通ハンドリング
       * - ログ出力
       * - Component 側で error を受け取れるよう再 throw
       */
      catchError((error) => {
        console.error('[getEvents] API Error:', error);
        return throwError(() => error);
      }),
    );
  }

  /**
   * イベント登録
   *
   * - POST で新しい家計簿イベントを作成
   * - 成功時は作成された Event が返る想定
   */
  createEvent(data: Partial<Event>): Observable<Event> {
    return this.http.post<Event>(this.baseUrl, data).pipe(
      catchError((error) => {
        console.error('[createEvent] API Error:', error);
        return throwError(() => error);
      }),
    );
  }

  /**
   * イベント更新
   *
   * - eventId を指定して PUT
   * - API 側の実装に応じて戻り値は Event or void
   */
  updateEvent(eventId: string, data: Partial<Event>): Observable<Event> {
    return this.http.put<Event>(`${this.baseUrl}/${eventId}`, data).pipe(
      catchError((error) => {
        console.error('[updateEvent] API Error:', error);
        return throwError(() => error);
      }),
    );
  }

  /**
   * イベント削除
   *
   * - eventId を指定して DELETE
   * - 成功時はメッセージ or void が返る想定
   */
  deleteEvent(eventId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${eventId}`).pipe(
      catchError((error) => {
        console.error('[deleteEvent] API Error:', error);
        return throwError(() => error);
      }),
    );
  }
}
