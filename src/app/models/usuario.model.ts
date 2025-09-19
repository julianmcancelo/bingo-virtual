/**
 * Modelo de Usuario para la aplicación Bingo Virtual
 * 
 * @class Usuario
 * @implements {Usuario}
 */

export interface Usuario {
  id: number;
  nombre_usuario: string;
  email: string;
  contrasena?: string;
  creado_en: Date | string;
  actualizado_en?: Date | string;
  
  // Campos de perfil
  apodo?: string;
  avatar_url?: string;
  biografia?: string;
  facebook_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
  es_perfil_publico?: boolean;
  fecha_ultimo_cambio_apodo?: Date | string;
  
  // Información de nivel (si está disponible)
  nivel?: {
    nivel_actual: number;
    experiencia_actual: number;
    experiencia_siguiente_nivel: number;
    progreso: number;
  };
}

/**
 * Interfaz para la actualización del perfil de usuario
 */
export interface ActualizarPerfilData {
  apodo?: string;
  biografia?: string | null;
  facebook_url?: string | null;
  twitter_url?: string | null;
  instagram_url?: string | null;
  linkedin_url?: string | null;
  es_perfil_publico?: boolean;
}

/**
 * Interfaz para la respuesta de verificación de cambio de apodo
 */
export interface VerificacionCambioApodo {
  puede_cambiar_apodo: boolean;
  dias_restantes: number;
  proximo_cambio_disponible: string;
}
