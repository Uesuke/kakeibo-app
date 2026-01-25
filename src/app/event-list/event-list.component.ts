import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { EventsService, Event } from '../services/events.service';

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

  constructor(
    private eventsService: EventsService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.fetchEvents();
  }

  fetchEvents() {
    this.eventsService.getEvents('Shin', '202601').subscribe({
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
}
