import { Component, EventEmitter, Output, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

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

  /** 入力フォーム定義 */
  form = this.fb.group({
    date: ['', Validators.required],
    isIncome: [true, Validators.required],
    paymentType: ['cash'], // 'cash' | 'credit'
    title: ['', Validators.required],
    amount: [null, [Validators.required, Validators.min(1)]],
  });

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
}
