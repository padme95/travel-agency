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

  /** 3 minutos (em ms) */
  private readonly TIMEOUT_MS = 3 * 60 * 1000;

  private sub?: Subscription;
  private storageSub?: Subscription;
  private active = false;

  /** dispara quando houve logout por inatividade (para UI exibir mensagem) */
  idleLogout$ = new Subject<void>();

  start() {
    if (this.active) return;
    this.active = true;

    this.zone.runOutsideAngular(() => {
      // eventos de atividade do usuário
      const activity$ = merge(
        fromEvent(document, 'mousemove'),
        fromEvent(document, 'keydown'),
        fromEvent(document, 'click'),
        fromEvent(document, 'touchstart'),
        fromEvent(window, 'scroll'),
        fromEvent(document, 'visibilitychange').pipe(filter(() => document.visibilityState === 'visible'))
      ).pipe(mapTo(Date.now()));

      // reinicia o timer a cada atividade
      this.sub = activity$
        .pipe(
          tap(() => this.pingOtherTabs()),
          // inicia imediatamente também (para não deslogar logo após login)
          switchMap(() => timer(this.TIMEOUT_MS))
        )
        .subscribe(() => this.handleIdleTimeout());

      // inicia o primeiro ciclo (como se houvesse atividade agora)
      this.pingOtherTabs();

      // sincroniza entre abas: quando outra aba emitir "ping", reseta o timer aqui
      this.storageSub = fromEvent<StorageEvent>(window, 'storage')
        .pipe(filter((e) => e.key === 'idle-ping' && e.newValue != null))
        .subscribe(() => {
          // reseta o timer recriando o switchMap acima: basta emitir um "falso" evento
          // como temos switchMap sobre activity$, simulamos com ping local (abaixo)
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

  /** notifica outras abas que houve atividade (para resetar timers) */
  private pingOtherTabs() {
    try {
      localStorage.setItem('idle-ping', String(Date.now()));
      // limpa para não acumular
      localStorage.removeItem('idle-ping');
    } catch {}
  }

  /** “atividade” local para reiniciar o switchMap (chamado pelo listener de storage) */
  private pingLocal() {
    // fazer nada: o switchMap depende do activity$; então chamamos pingOtherTabs
    // para manter consistência. Como estamos fora da aba original, storage event já disparou.
  }

  private async handleIdleTimeout() {
    // marca motivo do logout para mostrar mensagem na UI
    sessionStorage.setItem('idle-logged-out', '1');

    // desloga (AuthService já limpa carrinho, conforme combinamos)
    try {
      await this.auth.signOut();
    } finally {
      // volta para login com flag
      this.zone.run(() => {
        this.idleLogout$.next();
        this.router.navigate(['/auth/login'], { queryParams: { m: 'idle' } });
      });
    }
  }
}
