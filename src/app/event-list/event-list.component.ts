import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { EventsService, Event } from '../services/events.service';
import { getPrevMonth, getNextMonth, getCurrentMonth } from '../utils/month.util';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss'],
})
export class EventListComponent implements OnInit {
  events: Event[] = [];

  totalIncome = 0;
  totalExpense = 0;
  balance = 0;

  userName = 'Shin';

  /** 表示中の月（YYYYMM） */
  currentMonth = getCurrentMonth();

  constructor(
    private eventsService: EventsService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.fetchEvents();
  }

  fetchEvents() {
    this.eventsService.getEvents(this.userName, this.currentMonth).subscribe({
      next: (items) => {
        this.events = items;
        this.calculateTotals();
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err),
    });
  }

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

  get formattedMonth(): string {
    const year = this.currentMonth.slice(0, 4);
    const month = this.currentMonth.slice(4, 6);
    return `${year}年${month}月`;
  }

  prevMonth() {
    this.currentMonth = getPrevMonth(this.currentMonth);
    this.fetchEvents();
  }

  nextMonth() {
    this.currentMonth = getNextMonth(this.currentMonth);
    this.fetchEvents();
  }

  goToCurrentMonth() {
    this.currentMonth = getCurrentMonth();
    this.fetchEvents();
  }
}
