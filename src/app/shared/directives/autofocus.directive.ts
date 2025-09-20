/**
 * DIRECTIVA AUTOFOCUS - Enfoca elemento automáticamente
 *
 * @authors Julián Manuel Cancelo & Nicolás Otero
 * @materia Algoritmos y Estructuras de Datos III (ALED3)
 * @profesor Sebastián Saldivar
 * @descripcion Directiva que enfoca automáticamente un elemento al cargar
 *
 * @complejidad O(1) - Operación constante
 */
import { Directive, ElementRef, AfterViewInit, Input } from '@angular/core';

@Directive({
  selector: '[appAutofocus]',
  standalone: true
})
export class AutofocusDirective implements AfterViewInit {

  @Input() autofocusDelay: number = 0; // Delay en ms antes de enfocar

  constructor(private elementRef: ElementRef) {}

  ngAfterViewInit() {
    if (this.autofocusDelay > 0) {
      setTimeout(() => {
        this.elementRef.nativeElement.focus();
      }, this.autofocusDelay);
    } else {
      this.elementRef.nativeElement.focus();
    }
  }
}
