import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
  {
    path: 'list',
    loadComponent: () =>
      import('./event-list/event-list.component').then((m) => m.EventListComponent),
  },
  {
    path: 'graph',
    loadComponent: () =>
      import('./graph-view/graph-view.component').then((m) => m.GraphViewComponent),
  },
  {
    path: 'calendar',
    loadComponent: () =>
      import('./calendar-view/calendar-view.component').then((m) => m.CalendarViewComponent),
  },
];
