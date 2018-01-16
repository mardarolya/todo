import { Component, ViewChild, ElementRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { User, UserService } from './services/user.service';

import { ParentClass } from './components/parent/parent';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})

export class AppComponent extends ParentClass {
  @ViewChild("projectName") projectName: ElementRef;
  public isLogged: Boolean = false;
  public user: User;
  public userProjects: any[];
  public isAddingProject: Boolean = false;
  public isEdittingProject: Boolean = false;
  public hideMenu: Boolean = false;
  public smallScreen: Boolean = false;
  public additingTask: Boolean = false;
  public dayForTasks: Date = new Date();
  public currentTasks: any[] = [];
  public tasksCheckCount: number = 0;
  public dayString: string;
  public dayState: string = ""; // день недели или сегодняб вчераб завтра
  public currentProjectId: string = null;

  public today:Date = new Date();

  public showModal: Boolean = false;
  public showModalInfo: Boolean = false;
  public modalTxt: string = null;
  public modalInfoTxt: string = null;
  public typeModal: string = null;
  public projectIdDelete: string;
  public taskIdDelete: string;
  public allTasksProgress: any[] = [];

  public days: string[] = ["TODAY", "TOMORROW", "YESTERDAY"]

  constructor(public translate: TranslateService,
              public userService: UserService) {  
    super();

    this.today.setHours(0);
    this.today.setMinutes(0);
    this.today.setSeconds(0);

    this.translate.setDefaultLang('en');
		this.translate.use('en');    

    window.onresize = (e) => {
      this.checkSize();
    }    
    this.checkSize();
    this.getDateTask();
  }

  public checkSize() {
    this.smallScreen = document.documentElement.clientWidth < 1150;
    if (this.smallScreen && !this.hideMenu) {
        this.hideMenu = true;
    }
  }

  public getDateTask() {
    this.dayForTasks.setHours(0);
    this.dayForTasks.setMinutes(0);
    this.dayForTasks.setSeconds(0);

    let d = this.dayForTasks.getDate();
    let m = this.dayForTasks.getMonth() + 1;
    let y = this.dayForTasks.getFullYear();

    let ds, ms: string;

    (d < 10) ? ds = "0" + d : ds = "" + d;
    (m < 10) ? ms = "0" + m : ms = "" + m;

    this.dayString = ds + "." + ms + "." + y;
    
    // вычисляем подпись
    let dayWeek = this.dayForTasks.getDay();
    switch(dayWeek) {
      case 0:
        this.dayState = "SUN_FULL";
        break;
      case 1:
        this.dayState = "MON_FULL";
        break;
      case 2:
        this.dayState = "TU_FULL";
        break;
      case 3:
        this.dayState = "WN_FULL";
        break;
      case 4:
        this.dayState = "TH_FULL";
        break;
      case 5:
        this.dayState = "FR_FULL";
        break;
      case 6:
        this.dayState = "SUT_FULL";
        break;
    }
    if (this.today.getDate() == this.dayForTasks.getDate() && 
        this.today.getMonth() == this.dayForTasks.getMonth() &&
        this.today.getFullYear() == this.dayForTasks.getFullYear()) {
        this.dayState = "TODAY";  
    } else {
      this.today.setDate(this.today.getDate() + 1);

      if (this.today.getDate() == this.dayForTasks.getDate() && 
          this.today.getMonth() == this.dayForTasks.getMonth() &&
          this.today.getFullYear() == this.dayForTasks.getFullYear()) {
          this.dayState = "TOMORROW";
          this.today.setDate(this.today.getDate() - 1);  
      } else {
        this.today.setDate(this.today.getDate() - 2);
        if (this.today.getDate() == this.dayForTasks.getDate() && 
          this.today.getMonth() == this.dayForTasks.getMonth() &&
          this.today.getFullYear() == this.dayForTasks.getFullYear()) {
          this.dayState = "YESTERDAY"; 
        }
        this.today.setDate(this.today.getDate() + 1); 
      }    
    }
  }

  public registerSuccess(event) {
    this.isLogged = true;
    this.user = event.user;
    this.getProgects();
  }

  public getProgects() {
    this.userService.getProjects(this.user, (result) => {
      if (result.message == "ok") {
        this.userProjects = result.projects;
        for (let i = 0, max = this.userProjects.length; i < max; i++) {
          this.userProjects[i].isEdditing = false;
        }
        this.getTasks(this.userProjects[0]._id); 
      }
    });
  }

  public projectEdit(projectId, nameProject) {
    nameProject = nameProject.trim();
    if (nameProject && nameProject != "") {
      this.userService.editProject(projectId, nameProject, (result)=>{
        if (result.message == "ok") {
           this.getProgects();
        }
        this.isEdittingProject = false;
      });
    } else {
      this.projectName.nativeElement.classList.add("error-field");
    }
  }

  public projectDelete(project) {
    this.typeModal = "project";
    this.modalTxt = "DELETE_PROJECT"
    this.showModal = true;
    this.projectIdDelete = project._id;
  }

  public projectAdd(nameProject: string) {
    nameProject = nameProject.trim();
    if (nameProject && nameProject != "") {
      this.userService.addProject(this.user.username, nameProject, (result)=>{
        if (result.message == "ok") {
          this.userProjects.push(result.project);
        }
        this.isAddingProject = false;
      });
    } else {
      this.projectName.nativeElement.classList.add("error-field");
    }
  }

  public removeError() {
    if (this.projectName.nativeElement.classList.contains("error-field")) {
      this.projectName.nativeElement.classList.remove("error-field")
    }    
  }

  public turnMenu() {
    this.hideMenu = !this.hideMenu;
  }
  
  public resultTask(result) {
    this.additingTask = false;
    if (result.hasOwnProperty("refresh")) {
      if (result.refresh) {
        this.getTasks(this.currentProjectId);
      }
    }
  }

  public getTasks(project_id) {
    this.currentProjectId = project_id;

    this.dayForTasks.setHours(0);
    this.dayForTasks.setMinutes(0);
    this.dayForTasks.setSeconds(0);

    this.userService.getTasks(this.user.username, project_id, this.dayForTasks, (result) => {
      this.currentTasks = result;
      for (let i = 0, max = this.currentTasks.length; i < max; i++) {
          this.currentTasks[i].isEdditing = false;
          if (this.currentTasks[i].isCheck == true) {
            this.checkTask(this.currentTasks[i]._id)
          }
          // this.currentTasks[i].isCheck = false;
      }
      this.checkSize();
      this.getParamsTasks();
    })    
  }

  public getParamsTasks() {
    this.tasksCheckCount = 0;
    for (let i = 0, max = this.currentTasks.length; i < max; i++) {
        if (this.currentTasks[i].isCheck)
          this.tasksCheckCount++;
    }
  }

  public checkDatepickerValue(event){
    super.checkDatepickerValue(event);
    this.selectDate();
  }

  public selectDate() {
    if (!this.dayForTasks)
      this.dayForTasks = new Date();
    this.getDateTask();
    this.getTasks(this.currentProjectId);
  }

  public checkTask(task_id) {
    let dd = this.today.getDate();
    let mm = this.today.getMonth();
    let yy = this.today.getFullYear();
    if (dd == this.dayForTasks.getDate() && 
        mm == this.dayForTasks.getMonth() &&
        yy == this.dayForTasks.getFullYear()) {
      let ds = (dd < 10) ? "0"+dd : dd;
      let ms = (mm < 9) ? "0"+(mm+1) : (mm+1);
      this.userService.completeTask(task_id, (result)=>{
        if (result.message == "ok") {
          for(let i=0, max = this.currentTasks.length; i<max; i++) {
            if (this.currentTasks[i]._id == task_id) {
              this.currentTasks[i].isCheck = true;
              let check = document.getElementById("chk_"+task_id);
              check.setAttribute("disabled", "disabled");
              break;
            }
          }   
          this.getParamsTasks();
        }
      });
    }
  }

  public deleteTask(task) {
    this.typeModal = "task";
    if (task.regular) {
      this.modalTxt = "DELETE_REGULAR_TASK"
    } else {
      this.modalTxt = "DELETE_TASK"
    }
    this.showModal = true;
    this.taskIdDelete = task._id;
  }

  public cancel() {
    this.showModal = false;
    this.modalTxt = null;
    this.typeModal = null;
  }

  public btnYesClick() {
    if (this.typeModal == "task") {
      this.userService.removeTask(this.taskIdDelete, (res)=>{
        this.getTasks(this.currentProjectId); 
      });      
    }
    if (this.typeModal == "project") {
      this.userService.removeProject(this.projectIdDelete, (result)=>{
        this.showModal = false;
        if (result.result == "task") {
          this.modalInfoTxt = "FORBIDDEN_DELETE_PROJECT";
          this.showModalInfo = true;
        }
        if (result.result == "ok") {
          this.getProgects();
        }
      })
    }
    if (this.typeModal == "projectTask") {
      
    }
    if (this.typeModal == "goout") {
      this.isLogged = false;
    }
    this.showModal = false;
    this.modalTxt = null;
    this.typeModal = null;
  }

  public goOut(){    
    this.modalTxt = "GO_OUT";
    this.typeModal = "goout";
    this.showModal = true;
  }

  public showStat(){
    this.userService.getTaskProgress(this.user, (result) => {
      if (result.message == "ok") {
        this.allTasksProgress = result.arr;
        this.modalInfoTxt = "STAT";
        this.showModalInfo = true;
      } else {
        console.log(result.message)
      }
    })
  }
  
}
