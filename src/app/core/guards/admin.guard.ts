import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AdminGuard {
  canActivate(): boolean {
    return true;
  }
}
