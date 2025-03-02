import { Route } from '@angular/router';
import { SignupComponent } from './pages/signup/signup.component';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { AuthGuard } from './guards/auth.guard';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ReportDetailsComponent } from './pages/report-details/report-details.component';

export const routes: Route[] = [
    { path: '', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
    { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
    { path: 'report/:id', component: ReportDetailsComponent, canActivate: [AuthGuard] },
    // Additional evaluation routes if needed.
    { path: '**', redirectTo: '' }
  ];