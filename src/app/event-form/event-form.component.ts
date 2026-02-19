import { Component, EventEmitter, Output, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Event } from '../services/events.service';
import { isCreditToPaymentType } from '../utils/payment.util';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.scss'],
})
export class EventFormComponent {
  private fb = inject(FormBuilder);

  /** 親コンポーネントから渡される「登録中フラグ」 */
  @Input() isSubmitting = false;

  /** 登録ボタン押下時のイベント */
  @Output() submitEvent = new EventEmitter<any>();

  /** キャンセル（モーダルを閉じる） */
  @Output() cancel = new EventEmitter<void>();

  /** 編集中イベント */
  @Input() editingEvent: Event | null = null;

  /** 今日の日付（YYYY-MM-DD） */
  private today = new Date().toISOString().slice(0, 10);

  /** 入力フォーム定義 */
  form = this.fb.group({
    date: [this.today, Validators.required],
    isIncome: [true, Validators.required],
    paymentType: ['cash'], // 'cash' | 'credit'
    title: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(1)]],
  });

  /** 編集時更新処理 */
  ngOnChanges() {
    if (this.editingEvent) {
      this.setFormForEdit(this.editingEvent);
    }
  }

  /** フォーム送信 */
  submit() {
    // 登録中 or フォーム不正の場合は送信しない
    if (this.form.invalid || this.isSubmitting) return;

    this.submitEvent.emit(this.form.value);
  }

  /** モーダルを閉じる */
  close() {
    this.cancel.emit();
  }

  private setFormForEdit(event: Event) {
    this.form.patchValue({
      date: this.toInputDate(event.date),
      isIncome: event.isIncome,
      paymentType: isCreditToPaymentType(event.isIncome, event.isCredit),
      title: event.title ?? '',
      amount: event.amount,
    });
  }

  private toInputDate(date: string): string {
    // 20260201 → 2026-02-01
    return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
  }
}
