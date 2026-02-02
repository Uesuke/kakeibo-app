import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { EventsService, Event } from '../services/events.service';
import { getPrevMonth, getNextMonth, getCurrentMonth } from '../utils/month.util';
import { EventFormComponent } from '../event-form/event-form.component';

@Component({
  selector: 'app-event-list',
  standalone: true,
  /**
   * standalone component のため、
   * - CommonModule（*ngFor, *ngIf, ngClass など）
   * - DecimalPipe（number パイプ）
   * - 子コンポーネント（EventFormComponent）
   * を明示的に imports に追加する
   */
  imports: [CommonModule, DecimalPipe, EventFormComponent],
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss'],
})
export class EventListComponent implements OnInit {
  /**
   * 表示対象の家計簿イベント一覧
   * API から取得したデータを保持する
   */
  events: Event[] = [];

  /** 収入合計 */
  totalIncome = 0;

  /** 支出合計 */
  totalExpense = 0;

  /** 差引（収入 − 支出） */
  balance = 0;

  /**
   * 一覧取得時に使用するユーザー名
   * ※ 将来的にはログイン情報から取得する想定
   */
  userName = 'Shin';

  /**
   * 現在表示中の月（YYYYMM）
   * 初期表示時は「今月」を設定
   */
  currentMonth = getCurrentMonth();

  /**
   * イベント登録モーダルの表示制御
   * true: 表示 / false: 非表示
   */
  showModal = false;

  isEditMode = false;

  /** 登録中フラグ（多重送信防止用） */
  isSubmitting = false;

  /** 編集中イベント */
  editingEvent: Event | null = null;

  constructor(
    /**
     * 家計簿イベント API 呼び出し用サービス
     */
    private eventsService: EventsService,

    /**
     * Change Detection を手動で制御するために使用
     * API レスポンス後の描画ズレ対策
     */
    private cdr: ChangeDetectorRef,
  ) {}

  /**
   * コンポーネント初期化時の処理
   * - 初期月（今月）のイベント一覧を取得
   */
  ngOnInit(): void {
    this.fetchEvents();
  }

  /**
   * API からイベント一覧を取得する
   * - userName + currentMonth を指定して月別に取得
   * - 取得後に合計金額を再計算
   */
  fetchEvents() {
    this.eventsService.getEvents(this.userName, this.currentMonth).subscribe({
      next: (items) => {
        this.events = items;
        this.calculateTotals();

        // 表示が反映されないケースへの保険
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err),
    });
  }

  /**
   * 収入・支出・差引を再計算する
   * - isIncome を基準に振り分け
   */
  calculateTotals() {
    this.totalIncome = 0;
    this.totalExpense = 0;

    for (const e of this.events) {
      if (e.isIncome) {
        this.totalIncome += e.amount;
      } else {
        this.totalExpense += e.amount;
      }
    }

    this.balance = this.totalIncome - this.totalExpense;
  }

  /**
   * 表示用の月フォーマット
   * YYYYMM → YYYY年MM月
   *
   * template 側をシンプルに保つため getter として定義
   */
  get formattedMonth(): string {
    const year = this.currentMonth.slice(0, 4);
    const month = this.currentMonth.slice(4, 6);
    return `${year}年${month}月`;
  }

  /**
   * 前の月へ切り替え
   * - 月変更後、イベント一覧を再取得
   */
  prevMonth() {
    this.currentMonth = getPrevMonth(this.currentMonth);
    this.fetchEvents();
  }

  /**
   * 次の月へ切り替え
   * - 月変更後、イベント一覧を再取得
   */
  nextMonth() {
    this.currentMonth = getNextMonth(this.currentMonth);
    this.fetchEvents();
  }

  /**
   * 「今月」へ戻す
   * - currentMonth を今月にリセット
   */
  goToCurrentMonth() {
    this.currentMonth = getCurrentMonth();
    this.fetchEvents();
  }

  /**
   * イベント登録モーダルを表示する
   */
  openModal() {
    this.editingEvent = null;
    this.isEditMode = false;
    this.showModal = true;
  }

  /**
   * イベント編集モードでモーダルを表示する
   * @param event
   */
  onEdit(event: Event) {
    this.editingEvent = event;
    this.isEditMode = true;
    this.showModal = true;
  }

  /**
   * イベント登録/編集モーダルを閉じる
   */
  closeModal() {
    this.showModal = false;
    this.editingEvent = null;
  }

  /**
   * フォーム送信時の処理
   * EventFormComponent から emit された値を受け取る
   */
  onSubmit(formValue: any) {
    const payload = {
      ...formValue,
      userName: this.userName,
      date: formValue.date.replace(/-/g, ''),
      isCredit: formValue.isIncome ? 0 : formValue.paymentType === 'credit' ? 1 : 0,
    };

    this.isSubmitting = true;

    const request$ = this.editingEvent
      ? this.eventsService.updateEvent(this.editingEvent.eventId, payload)
      : this.eventsService.createEvent(payload);

    request$.subscribe({
      next: () => {
        this.closeModal();
        this.fetchEvents();
      },
      error: (err) => console.error(err),
      complete: () => (this.isSubmitting = false),
    });
  }

  /**
   * 削除処理
   */
  delete(event: Event) {
    const ok = confirm(`「${event.title}」を削除しますか？`);
    if (!ok) return;

    this.eventsService.deleteEvent(event.eventId).subscribe({
      next: () => this.fetchEvents(),
      error: (err) => console.error('削除失敗', err),
    });
  }
}
