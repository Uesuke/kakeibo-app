import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserStateService, AppUser } from '../core/user-state.service';

type UserType = 'shin' | 'saya' | 'both';
type ViewType = 'list' | 'graph' | 'calendar';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  /** ユーザー切り替えイベント */
  @Output() userChange = new EventEmitter<UserType>();

  /** 画面遷移イベント */
  @Output() navigate = new EventEmitter<ViewType>();

  constructor(
    private router: Router,
    private userState: UserStateService,
  ) {}

  onUserChange(user: AppUser) {
    this.userState.setUser(user);
  }

  go(view: ViewType) {
    this.router.navigate([view]);
  }
}
