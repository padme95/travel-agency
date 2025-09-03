import { Injectable, NgZone, inject } from '@angular/core';
import { Router } from '@angular/router';
import { fromEvent, merge, Subject, Subscription, timer } from 'rxjs';
import { filter, mapTo, switchMap, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class IdleLogoutService {
  private zone = inject(NgZone);
  private router = inject(Router);
  private auth = inject(AuthService);

  private readonly TIMEOUT_MS = 3 * 60 * 1000;

  private sub?: Subscription;
  private storageSub?: Subscription;
  private active = false;

  idleLogout$ = new Subject<void>();

  start() {
    if (this.active) return;
    this.active = true;

    this.zone.runOutsideAngular(() => {
      const activity$ = merge(
        fromEvent(document, 'mousemove'),
        fromEvent(document, 'keydown'),
        fromEvent(document, 'click'),
        fromEvent(document, 'touchstart'),
        fromEvent(window, 'scroll'),
        fromEvent(document, 'visibilitychange').pipe(filter(() => document.visibilityState === 'visible'))
      ).pipe(mapTo(Date.now()));

      this.sub = activity$
        .pipe(
          tap(() => this.pingOtherTabs()),
          switchMap(() => timer(this.TIMEOUT_MS))
        )
        .subscribe(() => this.handleIdleTimeout());
      this.pingOtherTabs();

      this.storageSub = fromEvent<StorageEvent>(window, 'storage')
        .pipe(filter((e) => e.key === 'idle-ping' && e.newValue != null))
        .subscribe(() => {
          this.pingLocal();
        });
    });
  }

  stop() {
    this.active = false;
    this.sub?.unsubscribe();
    this.storageSub?.unsubscribe();
    this.sub = undefined;
    this.storageSub = undefined;
  }

  private pingOtherTabs() {
    try {
      localStorage.setItem('idle-ping', String(Date.now()));
      localStorage.removeItem('idle-ping');
    } catch {}
  }

  private pingLocal() {
   }

  private async handleIdleTimeout() {
    sessionStorage.setItem('idle-logged-out', '1');

    try {
      await this.auth.signOut();
    } finally {
      this.zone.run(() => {
        this.idleLogout$.next();
        this.router.navigate(['/auth/login'], { queryParams: { m: 'idle' } });
      });
    }
  }
}
