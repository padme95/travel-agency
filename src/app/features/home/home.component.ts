import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [RouterLink],
  template: `
    <h1>Rosa & Ilías Viagens</h1>
    <p>Pacotes para a Turquia, com curadoria especial.</p>
    <a routerLink="/pacotes">Ver pacotes</a>
  `
})
export class HomeComponent {}
