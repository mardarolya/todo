import { CalendarLang } from '../../services/settings';

export class ParentClass {
    public keyBackspace: boolean = false;
    
    public calendarLang: any;
    public currentLang: any;
    public lang: string;

    constructor() {
        this.lang = localStorage.getItem("user-lang-todo") || "ua";
        this.calendarLang = new CalendarLang();
        this.currentLang = this.calendarLang[this.lang]; 
    }

  public keyDownDatepicker(event) {
      let nameProp = (event.hasOwnProperty("srcElement")) ? "srcElement" : "target";
      let i = event[nameProp].selectionStart;
      let str = event[nameProp].value;

      let newI = i;

      if (event.code == "Backspace" || event.code == "Delete") {
          this.keyBackspace = true;
          if (event.code == "Backspace" && str[i-1] == ".") {
              newI = i - 1;
          } else if (event.code == "Delete" && str[i] == ".") {
              newI = i + 1;               
          }
          if (i != newI) {
              event[nameProp].selectionStart = newI;
              event[nameProp].selectionEnd = newI;
              event.preventDefault();
          }        
      } else {
          this.keyBackspace = false
      }
  }

  public checkDatepickerValue(event) {
      let nameProp = (event.hasOwnProperty("srcElement")) ? "srcElement" : "target";
      let val = (event[nameProp].value).split(".");
      if (val.length != 3) {
          event[nameProp].value = null;
      } else if (val[0].length != 2 || val[1].length !=2 || val[2] != 4) {
          event[nameProp].value = null; 
      } else {
          let newDate = new Date(val[2], (val[1] - 1), val[0], 0, 0, 0, 0);
          let upLevel = new Date(2030, 11, 31, 0, 0, 0, 0);
          let downLevel = new Date(1910, 0, 1, 0, 0, 0, 0);
          if (newDate < downLevel || newDate > upLevel) {
              event[nameProp].value = null; 
          }
      }
  }

  public inputDatepicker(event) {
      let nameProp = (event.hasOwnProperty("srcElement")) ? "srcElement" : "target";
      let i = event[nameProp].selectionStart;
      let str = event[nameProp].value;
      if (str == "..") {
          event[nameProp].value = "";
          event[nameProp].selectionStart = 1;
          event[nameProp].selectionEnd = 1;
      }
      let elemIndex = i - 1;
      if (!this.keyBackspace) {
          let ss = str.substring(0, str.length);
          if (['0','1', '2', '3', '4', '5', '6', '7', '8', '9'].indexOf(str[elemIndex]) != -1) {
              switch(elemIndex) {
                  case 0:
                      if ((['0', '1', '2', '3'].indexOf(str[elemIndex]) == -1)) {
                          ss = "0" + str[elemIndex] + ss.substring(elemIndex+1);
                          (ss.length > 2 && ss[2] == ".") ? i = 3 : i = 2;
                      } else {
                          ss = str[elemIndex] + ss.substring(elemIndex+1);
                          i = 1;
                      }
                      if (ss.length > 3 && ss[2] != ".") {
                          let pos = ss.indexOf(".");
                          ss = ss.substring(0, i) + ss.substring(pos);
                      }
                      break;
                  case 1:
                      if (str[elemIndex - 1] == "3" && ['0', '1', '2'].indexOf(str[elemIndex]) == -1) {
                          ss = ss.substring(0, elemIndex) + '0' + ss.substring(elemIndex+1);
                      } else {
                          ss = ss.substring(0, elemIndex) + str[elemIndex] + ss.substring(elemIndex + 1)       
                      }
                      if (str.length > 3 && str[2] != ".") 
                        ss = ss.substring(0, 2) + ss.substring(3);

                      (ss.length > 2 && ss[2] == ".") ? i = 3 : i = 2;
                      break;
                  case 2: 
                        ss = ss.substring(0, elemIndex) + ss.substring(elemIndex + 1); 
                        i = 3;   
                        break;
                  case 3:
                      if (['0', '1'].indexOf(str[elemIndex]) == -1) {
                          ss = ss.substring(0, elemIndex) + "0" + str[elemIndex] + ss.substring(elemIndex + 1);
                          (ss.length > 5 && ss[5] == ".") ? i = 6 : i = 5;
                      } else {
                          ss = ss.substring(0, elemIndex) + str[elemIndex] + ss.substring(elemIndex + 1)                                ;
                          i = 4;
                      }   
                      if (ss.length > 5 && ss[5] != ".") {
                          let pos = ss.lastIndexOf(".");
                          ss = ss.substring(0, i) + ss.substring(pos);
                      }
                      break;
                  case 4:
                      if (str[elemIndex - 1] == '0'){
                          if (str[elemIndex] == '0') {
                              ss = ss.substring(0, elemIndex) + ss.substring(elemIndex + 1);
                              i = 4;
                          } else {
                              ss = ss.substring(0, elemIndex) + str[elemIndex] + ss.substring(elemIndex + 1);  
                              (str.length > 5 && str[5] == ".") ? i = 6 : i = 5;                              
                          }
                      } else if (str[elemIndex - 1] == '1') {
                          if (['0', '1', '2'].indexOf(str[elemIndex]) == -1) {
                              ss = ss.substring(0, elemIndex) + ss.substring(elemIndex + 1);
                              i = 4;
                          } else {
                              ss = ss.substring(0, elemIndex) + str[elemIndex] + ss.substring(elemIndex + 1);
                              (str.length > 5 && str[5] == ".") ? i = 6 : i = 5;  
                          }
                      }
                      if (ss.length > 5 && ss[5] != ".") 
                        ss = ss.substring(0, 5) + ss.substring(6);
                      break;
                  case 5: 
                        ss = ss.substring(0, i-1) + ss.substring(i);  
                        i = 6;  
                        break;
                  case 6:
                      switch (str[elemIndex]) {
                          case '0':
                              ss = ss.substring(0, elemIndex) + "2" + str[elemIndex] + ss.substring(elemIndex + 1);
                              i = 8;
                              break;
                          case '1':
                          case '2':
                              ss = ss.substring(0, elemIndex) + str[elemIndex] + ss.substring(elemIndex + 1);
                              i = 7;
                              break;
                          case '9':
                              ss = ss.substring(0, elemIndex) + "1" + str[elemIndex] + ss.substring(elemIndex + 1);
                              i = 8;
                              break;
                          default: 
                              ss = ss.substring(0, elemIndex) + ss.substring(elemIndex + 1);; 
                              i = 6;  
                      }
                      break;
                  case 7: 
                      if (str[elemIndex - 1] == '1') {
                          if (str[elemIndex] == '9') {
                              ss = ss.substring(0, elemIndex) + str[elemIndex] + ss.substring(elemIndex+1);
                              i = 8;
                          } else {
                              ss = ss.substring(0, elemIndex) + ss.substring(elemIndex+1);
                              i = 7;
                          }
                      }
                      if (str[elemIndex - 1] == '2') {
                          if (str[elemIndex] == '0') {
                              ss = ss.substring(0, elemIndex) + str[elemIndex] + ss.substring(elemIndex+1);
                              i = 8;
                          } else {
                              ss = ss.substring(0, elemIndex) + ss.substring(elemIndex+1);
                              i = 7;
                          }
                      }
                      break; 
                  default:
                      ss = ss;
              }
              if (ss.length == 2) {
                    if (ss[1] != ".") ss = ss + ".";
                    i = 3;
              } else if (ss.length == 5) {
                  if (ss[4] != ".") {
                      ss = ss + ".";
                      i = 6
                  }
              }
              let l = (ss.length > 10) ? 10 : ss.length;
              str = ss.substring(0, l);
          } else {
              str = str.substring(0, i-1) + str.substring(i);
          }
          event[nameProp].value = str;
          event[nameProp].selectionStart = i;
          event[nameProp].selectionEnd = i;
      } 
  }
}