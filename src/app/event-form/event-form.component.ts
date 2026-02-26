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
    paymentType: ['cash'],
    title: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(1)]],
    isSplit: [false],
    advanceAmount: [0],
  });

  constructor() {
    this.setupAutoAdvanceCalculation();
  }

  private setupAutoAdvanceCalculation() {
    const isSplitCtrl = this.form.get('isSplit');
    const amountCtrl = this.form.get('amount');

    if (!isSplitCtrl || !amountCtrl) return;
    // 割り勘ON/OFFで再計算
    isSplitCtrl.valueChanges.subscribe((isSplit) => {
      this.applySplitCalculation(isSplit, amountCtrl.value);
    });

    // 金額変更時も再計算（割り勘ONの時のみ）
    amountCtrl.valueChanges.subscribe((amount) => {
      if (isSplitCtrl.value) {
        this.applySplitCalculation(true, amount);
      }
    });
  }

  private applySplitCalculation(
    isSplit: boolean | null | undefined,
    amount: number | null | undefined,
  ) {
    if (!isSplit) return;

    const safeAmount = Number(amount ?? 0);
    const half = Math.floor(safeAmount / 2);

    this.form.patchValue({ advanceAmount: half }, { emitEvent: false });
  }

  get previewAdvance(): number {
    const v = this.form.value;

    if (v.isIncome) return 0;

    let advance = 0;

    if (v.isSplit && v.amount) {
      advance += Math.floor(v.amount / 2);
    }

    if (!v.isSplit && v.advanceAmount) {
      advance += Number(v.advanceAmount);
    }

    return advance;
  }

  /** 編集時更新処理 */
  ngOnChanges() {
    if (this.editingEvent) {
      this.setFormForEdit(this.editingEvent);

      if (this.form.value.isSplit) {
        this.applySplitCalculation(true, this.form.value.amount);
      }
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
      isSplit: event.isSplit ?? false,
      advanceAmount: event.advanceAmount ?? 0,
    });
  }

  private toInputDate(date: string): string {
    // 20260201 → 2026-02-01
    return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
  }
}
