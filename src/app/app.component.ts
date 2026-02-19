import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  selectedUser: 'shin' | 'saya' | 'both' = 'both';
  currentView: 'list' | 'graph' | 'calendar' = 'list';

  constructor(private router: Router) {}

  onUserChange(user: 'shin' | 'saya' | 'both') {
    this.selectedUser = user;
  }

  onNavigate(view: 'list' | 'graph' | 'calendar') {
    this.currentView = view;
  }
}
