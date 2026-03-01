import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdvanceBalanceService, AdvanceBalanceView } from '../services/advance-balance.service';

@Component({
  selector: 'app-advance-balance-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './advance-balance-card.component.html',
  styleUrls: ['./advance-balance-card.component.scss'],
})
export class AdvanceBalanceCardComponent implements OnInit {
  private service = inject(AdvanceBalanceService);
  private cdr = inject(ChangeDetectorRef);

  loading = true;
  error = false;
  balance: AdvanceBalanceView | null = null;

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.error = false;

    this.service.getBalanceView().subscribe({
      next: (data) => {
        this.balance = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[AdvanceBalanceCard] load error', err);
        this.error = true;
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  /**
   * 表示メッセージ生成
   */
  get message(): string {
    if (!this.balance) return '';

    if (this.balance.amount === 0) {
      return '立替は発生していません';
    }

    return `${this.balance.debtor} → ${this.balance.creditor}`;
  }
}
