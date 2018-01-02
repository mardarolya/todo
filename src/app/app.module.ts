import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { HttpClientModule, HttpClient} from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CalendarModule } from 'primeng/components/calendar/calendar';
import { SpinnerModule } from 'primeng/components/spinner/spinner';
import { DropdownModule } from 'primeng/components/dropdown/dropdown';


import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';

import { AppComponent } from './app.component';

import { UserService } from './services/user.service';
import { LoginComponent } from './components/login/login.component';
import { TaskComponent } from './components/task/task.component';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, "./i18n/",  ".json?id=2");
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    TaskComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    HttpClientModule,
    BrowserAnimationsModule,
    CalendarModule,
    SpinnerModule,
    DropdownModule,
    TranslateModule.forRoot({
        loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient]
        }
    }), 
  ],
  providers: [ UserService ],
  bootstrap: [AppComponent]
})
export class AppModule { }
