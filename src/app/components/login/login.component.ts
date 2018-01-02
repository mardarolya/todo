import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { User, UserService } from './../../services/user.service';
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  @ViewChild("userName") userName: ElementRef;
  @ViewChild("userPassword") userPassword: ElementRef;
  @ViewChild("langEn") langEn: ElementRef;
  @ViewChild("langRu") langRu: ElementRef;
  @ViewChild("langUa") langUa: ElementRef;

  @Output() authorisation: EventEmitter<any> = new EventEmitter<any>();

  public user: User = new User();
  public hasError: Boolean = false;
  public newAccount: Boolean = false;
  public existAccount: Boolean = false;
  public rememberUser: Boolean = false;
  public langUser: string = "en";

  constructor(public userService: UserService,
              public translate: TranslateService) { }

  ngOnInit() {
    let l = localStorage.getItem("langToDo");
    (l) ? this.langUser = l : this.langUser = this.translate.getDefaultLang();
    this.markLang(this.langUser);
    
    let userStoredLogin = localStorage.getItem("loginToDo");
    let userStoredPassword = localStorage.getItem("passwordToDo");

    if (userStoredLogin && userStoredPassword) {
      this.user.username = userStoredLogin;
      this.user.password = userStoredPassword;
      this.rememberUser = true;
    }   
  }

  public validate() {
    let res = false;
    if (this.user.username && this.user.password) {
      res = true;
    } else {
      this.hasError = true;
      if (!this.user.username) {
        this.userName.nativeElement.classList.add("error-field");
      }
      if (!this.user.password) {
        this.userPassword.nativeElement.classList.add("error-field");
      }
    }
    return res;
  }

  public toRemeberUser(){
    if (this.rememberUser) {
      localStorage.setItem("loginToDo", this.user.username);
      localStorage.setItem("passwordToDo", this.user.password);
      localStorage.setItem("langToDo", this.langUser);
    } else {
      localStorage.clear();
    }
  }

  public toAuthorize(){
    this.toRemeberUser();
    this.authorisation.emit({ user: this.user });
  }

  public checkUser() {
    if (this.validate()){
      this.userService.checkUser(this.user, 
      (result) => {
        if (!result) {
          this.newAccount = true;
        } else {
          this.userService.checkPassword(this.user, (result)=>{
            if (result.result) {
              this.toAuthorize();
            } else {
              this.existAccount = true
            }
          })
        }
      }, ()=>{});
    }       
  }

  public createUser() {
    this.userService.addUser(this.user, 
      (newUser) => {
        if (newUser) {
          this.newAccount = false;
          this.toAuthorize();
        }
      }, ()=>{});
  }

  public removeError() {
    if (this.userName.nativeElement.classList.contains("error-field")) {
      this.userName.nativeElement.classList.remove("error-field")
    }
    if (this.userPassword.nativeElement.classList.contains("error-field")) {
      this.userPassword.nativeElement.classList.remove("error-field")
    }
    this.hasError = false;
  }

  public changeLang(lang: string) {
    this.translate.use(lang); 
    this.translate.setDefaultLang(lang);
    this.langUser = lang;

    this.markLang(lang);
  }

  public markLang(lang: string) {
    if (this.langEn.nativeElement.classList.contains("mark-lang")) {
      this.langEn.nativeElement.classList.remove("mark-lang")
    }  
    if (this.langRu.nativeElement.classList.contains("mark-lang")) {
      this.langRu.nativeElement.classList.remove("mark-lang")
    } 
    if (this.langUa.nativeElement.classList.contains("mark-lang")) {
      this.langUa.nativeElement.classList.remove("mark-lang")
    }

    switch (lang) {
      case "en":
        this.langEn.nativeElement.classList.add("mark-lang");
        break;
      case "ru":
        this.langRu.nativeElement.classList.add("mark-lang");
        break;
      case "ua":
        this.langUa.nativeElement.classList.add("mark-lang");
        break;
      default: 
        this.langEn.nativeElement.classList.add("mark-lang");
    }
  }
}
