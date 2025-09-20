/**
 * DIRECTIVA HIGHLIGHT - Resalta texto automáticamente
 *
 * @authors Julián Manuel Cancelo & Nicolás Otero
 * @materia Algoritmos y Estructuras de Datos III (ALED3)
 * @profesor Sebastián Saldivar
 * @descripcion Directiva que resalta texto automáticamente al hacer hover
 *
 * @complejidad O(1) - Operación constante
 */
import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: true
})
export class HighlightDirective {

  @Input() highlightColor: string = '#ffff00'; // Color por defecto amarillo
  @Input() highlightClass: string = 'highlight-text';

  private originalBackground: string = '';
  private originalClass: string = '';

  constructor(private el: ElementRef) {
    this.originalClass = this.el.nativeElement.className;
  }

  @HostListener('mouseenter') onMouseEnter() {
    this.originalBackground = this.el.nativeElement.style.backgroundColor;
    this.el.nativeElement.style.backgroundColor = this.highlightColor;
    this.el.nativeElement.classList.add(this.highlightClass);
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.el.nativeElement.style.backgroundColor = this.originalBackground;
    this.el.nativeElement.classList.remove(this.highlightClass);
  }
}
