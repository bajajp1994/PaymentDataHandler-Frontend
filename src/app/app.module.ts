import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module'; // Import the routing module
import { MainScreenComponent } from './main-screen/main-screen.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table'; // Import MatTableModule
import { CommonModule } from '@angular/common';  // Import this to use pipes like 'currency'
import { CurrencyPipe } from '@angular/common';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { HttpClientModule } from '@angular/common/http';


@NgModule({
  declarations: [
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    NgbModule,
    FormsModule,
    MatTableModule,
    CommonModule,
    MainScreenComponent,
    AppComponent,
    HttpClientModule
  ],
  providers: [CurrencyPipe],
  bootstrap: [AppComponent],
})
export class AppModule { }
