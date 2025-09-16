/**
 * Universidad Nacional de La Plata - Facultad de Informática
 * Algoritmos y Estructuras de Datos III (ALED3) - 2024
 * 
 * Trabajo Final: Bingo Virtual Educativo
 * 
 * Autores:
 * - Julián Manuel Cancelo
 * - Nicolás Otero
 * 
 * Profesor: Sebastián Saldivar
 */

import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { Subscription } from 'rxjs';
import { ChatService } from '../../../services/chat.service';
import { MensajeChat, Jugador } from '../../../services/socket.service';

@Component({
  selector: 'app-chat-flotante',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatBadgeModule],
  templateUrl: './chat-flotante.component.html',
  styleUrls: ['./chat-flotante.component.css']
})
export class ChatFlotanteComponent implements OnInit, OnDestroy, AfterViewChecked {
  @Input() salaId: string = '';
  @Input() jugadorActual: Jugador | null = null;
  @Input() posicion: 'bottom-right' | 'bottom-left' = 'bottom-right';

  @ViewChild('chatMessages') chatMessages!: ElementRef;

  mensajes: MensajeChat[] = [];
  nuevoMensaje: string = '';
  chatAbierto: boolean = false;
  mensajesNoLeidos: number = 0;
  
  private subscriptions: Subscription[] = [];
  private shouldScrollToBottom = false;

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    this.inicializarSubscripciones();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  /**
   * Inicializa las subscripciones a los observables del servicio
   */
  private inicializarSubscripciones(): void {
    // Suscribirse a los mensajes
    const mensajesSub = this.chatService.getMensajes().subscribe(mensajes => {
      console.log('Chat: Mensajes recibidos:', mensajes);
      this.mensajes = mensajes;
      this.shouldScrollToBottom = true;
    });

    // Suscribirse al estado del chat
    const chatAbiertoSub = this.chatService.isChatAbierto().subscribe(abierto => {
      console.log('Chat: Estado abierto:', abierto);
      this.chatAbierto = abierto;
      if (abierto) {
        this.shouldScrollToBottom = true;
      }
    });

    // Suscribirse a mensajes no leídos
    const noLeidosSub = this.chatService.getMensajesNoLeidos().subscribe(count => {
      console.log('Chat: Mensajes no leídos:', count);
      this.mensajesNoLeidos = count;
    });

    this.subscriptions.push(mensajesSub, chatAbiertoSub, noLeidosSub);
  }

  /**
   * Alterna la visibilidad del chat
   */
  toggleChat(): void {
    this.chatService.toggleChat();
  }

  /**
   * Envía un mensaje al chat
   */
  enviarMensaje(): void {
    if (this.nuevoMensaje.trim() && this.salaId && this.jugadorActual) {
      this.chatService.enviarMensaje(this.salaId, this.jugadorActual.nombre, this.nuevoMensaje);
      this.nuevoMensaje = '';
    }
  }

  /**
   * Maneja el evento de tecla Enter
   */
  onEnterPressed(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.enviarMensaje();
    }
  }

  /**
   * Verifica si un mensaje es del jugador actual
   */
  esMensajePropio(mensaje: MensajeChat): boolean {
    return this.chatService.esMensajePropio(mensaje, this.jugadorActual?.nombre || '');
  }

  /**
   * Formatea la hora de un mensaje
   */
  formatearHora(timestamp: Date): string {
    return this.chatService.formatearHora(timestamp);
  }

  /**
   * Hace scroll al final del chat
   */
  private scrollToBottom(): void {
    try {
      if (this.chatMessages) {
        const element = this.chatMessages.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    } catch (err) {
      console.error('Error al hacer scroll en el chat:', err);
    }
  }

  /**
   * Obtiene las clases CSS para la posición del chat
   */
  get posicionClasses(): string {
    return this.posicion === 'bottom-left' ? 'chat-bottom-left' : 'chat-bottom-right';
  }
}
