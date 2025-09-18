import { ApplicationConfig, PLATFORM_ID } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { LevelService } from './services/level.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withComponentInputBinding(),
      withViewTransitions({
        skipInitialTransition: true,
      }),
    ),
    provideAnimations(),
    provideHttpClient(),
    provideAnimationsAsync(),
    provideAnimationsAsync(),
    LevelService,
    { provide: 'isBrowser', useFactory: (id: Object) => isPlatformBrowser(id), deps: [PLATFORM_ID] }
  ]
};
