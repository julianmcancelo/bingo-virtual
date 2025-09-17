import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { map, Observable, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (
  route,
  state
): Observable<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    map(user => {
      if (user) {
        return true;
      }
      
      // Store the attempted URL for redirecting after login
      authService.redirectUrl = state.url;
      
      // Redirect to the login page with the return url
      return router.createUrlTree(['/auth/login'], { 
        queryParams: { returnUrl: state.url } 
      });
    })
  );
};
