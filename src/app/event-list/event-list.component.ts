import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { forkJoin, finalize } from 'rxjs';
import { EventsService, Event } from '../services/events.service';
import { getPrevMonth, getNextMonth, getCurrentMonth } from '../utils/month.util';
import { EventFormComponent } from '../event-form/event-form.component';
import { UserStateService, AppUser } from '../core/user-state.service';
import { paymentTypeToIsCredit } from '../utils/payment.util';

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
  private eventsService = inject(EventsService);
  private userState = inject(UserStateService);

  /**
   * 表示対象の家計簿イベント一覧
   * API から取得したデータを保持する
   */
  events: Event[] = [];
  selectedUser: AppUser = 'both';

  /** 収入合計 */
  totalIncome = 0;

  /** 支出合計 */
  totalExpense = 0;

  /** 差引（収入 − 支出） */
  balance = 0;

  /** 編集・更新用の元日付 */
  originalDate: string = '';

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
    this.userState.user$.subscribe((user) => {
      this.selectedUser = user;
      this.fetchEvents();
    });
  }

  fetchEvents() {
    if (this.selectedUser === 'both') {
      /**
       * 両ユーザーを並列取得
       * forkJoin は全API完了後に配列で返す
       */
      forkJoin([
        this.eventsService.getEvents('shin', this.currentMonth),
        this.eventsService.getEvents('saya', this.currentMonth),
      ]).subscribe({
        next: ([shinEvents, sayaEvents]) => {
          this.events = [...shinEvents, ...sayaEvents].sort((a, b) => b.date.localeCompare(a.date));

          this.calculateTotals();
          this.cdr.detectChanges();
        },
        error: (err) => console.error('イベント取得失敗', err),
      });

      return;
    }

    /**
     * 単一ユーザー取得
     */
    this.eventsService.getEvents(this.selectedUser, this.currentMonth).subscribe({
      next: (events) => {
        this.events = events.sort((a, b) => b.date.localeCompare(a.date));

        this.calculateTotals();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('イベント取得失敗', err),
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

  /** 表示用イベント */
  get filteredEvents() {
    if (this.selectedUser === 'both') {
      return this.events;
    }
    return this.events.filter((e) => e.userName === this.selectedUser || e.userName === 'both');
  }

  /**
   * 前の月へ切り替え
   * - 月変更後、イベント一覧を再取得
   */
  prevMonth() {
    this.currentMonth = getPrevMonth(this.currentMonth);
    this.fetchEvents();
    this.cdr.detectChanges();
  }

  /**
   * 次の月へ切り替え
   * - 月変更後、イベント一覧を再取得
   */
  nextMonth() {
    this.currentMonth = getNextMonth(this.currentMonth);
    this.fetchEvents();
    this.cdr.detectChanges();
  }

  /**
   * 「今月」へ戻す
   * - currentMonth を今月にリセット
   */
  goToCurrentMonth() {
    this.currentMonth = getCurrentMonth();
    this.fetchEvents();
    this.cdr.detectChanges();
  }

  /**
   * イベント登録モーダルを表示する
   */
  openModal() {
    if (this.selectedUser === 'both') return;
    this.editingEvent = null;
    this.isEditMode = false;
    this.showModal = true;
  }

  /**
   * イベント編集モードでモーダルを表示する
   * @param event
   */
  openEditModal(event: Event) {
    if (this.selectedUser === 'both') return;
    this.editingEvent = event;
    this.originalDate = event.date;
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
    if (this.selectedUser === 'both') {
      alert('登録するユーザーを選択してください');
      return;
    }

    const newDate = formValue.date.replace(/-/g, '');

    const payload = {
      ...formValue,
      userName: this.selectedUser,
      date: newDate,
      isCredit: paymentTypeToIsCredit(formValue.isIncome, formValue.paymentType),
    };

    this.isSubmitting = true;

    let request$;

    if (this.editingEvent) {
      if (this.originalDate !== newDate) {
        request$ = this.eventsService.changeEventDate(this.editingEvent.eventId, {
          oldDate: this.originalDate,
          newDate,
        });
      } else {
        request$ = this.eventsService.updateEvent(this.editingEvent.eventId, payload);
      }
    } else {
      request$ = this.eventsService.createEvent(payload);
    }

    request$
      .pipe(
        // UIロック解除
        finalize(() => {
          this.isSubmitting = false;
        }),
      )
      .subscribe({
        next: () => {
          this.closeModal();
          this.fetchEvents();
          this.cdr.detectChanges();
        },
        error: (err) => console.error(err),
      });
  }

  /**
   * 削除処理
   */
  delete(event: Event) {
    const ok = confirm(`「${event.title}」を削除しますか？`);
    if (!ok) return;

    this.eventsService.deleteEvent(event.eventId).subscribe({
      next: () => {
        this.fetchEvents();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('削除失敗', err),
    });
  }
}
