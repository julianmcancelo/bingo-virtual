import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * Componente para seleccionar un avatar de una lista predefinida
 * 
 * @component
 * @selector app-avatar-selector
 * 
 * @author Julián Cancelo <julian.cancelo@alumnos.info.unlp.edu.ar>
 * @author Nicolás Otero <nicolas.otero@alumnos.info.unlp.edu.ar>
 */
@Component({
  selector: 'app-avatar-selector',
  templateUrl: './avatar-selector.component.html',
  styleUrls: ['./avatar-selector.component.scss']
})
export class AvatarSelectorComponent {
  @Input() avatares: string[] = [];
  @Input() avatarSeleccionado: string | null = null;
  @Output() avatarSeleccionadoChange = new EventEmitter<string>();

  /**
   * Maneja la selección de un avatar
   * @param avatarUrl URL del avatar seleccionado
   */
  seleccionarAvatar(avatarUrl: string): void {
    this.avatarSeleccionado = avatarUrl;
    this.avatarSeleccionadoChange.emit(avatarUrl);
  }
}
