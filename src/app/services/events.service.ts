import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

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
  private baseUrl = `${environment.apiBaseUrl}/events`;

  constructor(private http: HttpClient) {}

  /** 一覧取得（月別） */
  getEvents(userName: string, month: string): Observable<Event[]> {
    const params = new HttpParams().set('userName', userName).set('month', month);

    return this.http.get<Event[]>(this.baseUrl, { params });
  }

  /** 登録 */
  createEvent(data: Partial<Event>) {
    return this.http.post<Event>(this.baseUrl, data);
  }

  /** 更新 */
  updateEvent(eventId: string, data: Partial<Event>) {
    return this.http.put(`${this.baseUrl}/${eventId}`, data);
  }

  /** 削除 */
  deleteEvent(eventId: string) {
    return this.http.delete(`${this.baseUrl}/${eventId}`);
  }
}
