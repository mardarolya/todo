import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { ParentClass } from './../parent/parent';
import { Task, User, UserService } from './../../services/user.service';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html'
})

export class TaskComponent extends ParentClass implements OnInit {
  @Input() task: Task = null;  
  @Input() project: string = null;
  @Input() dayForOnceTask: Date = null; // дата создания задачи
  @Input() user: User;

  @Output() resultTask: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild("taskName") taskName: ElementRef;

  public projects: any[] = [{label: null, value: null}];

  public regularTask: any;
  public spinnerDays: number[] = [1];
  public calendarDays: any[] = [new Date()];

  public hasError: Boolean = false;
  public weekDays: string[] = [ "SUN_SHORT", "MON_SHORT", "TU_SHORT", "WN_SHORT", "TH_SHORT", "FR_SHORT", "SUT_SHORT"];
  
  public mode: string = "add";

  constructor (public userService: UserService) {
      super();
  }    

  ngOnInit() {
    if (!this.task) {
      this.mode = 'add';
      this.task = new Task();
      this.regularTask = "regular_task";
      this.task.type = "everyday";
    }

    if (!this.dayForOnceTask) 
      this.dayForOnceTask = new Date();

    this.dayForOnceTask.setHours(0);
    this.dayForOnceTask.setMinutes(0);
    this.dayForOnceTask.setSeconds(0);

    this.getProgects();
  }

  public getProgects() {
    this.userService.getProjects(this.user, (result) => {
      if (result.message == "ok") {
        for (let i = 0, max = result.projects.length; i < max; i++) {
          this.projects.push({label: result.projects[i].name, value: result.projects[i]._id});
        }
        if (!this.project) {
          this.project = this.projects[0].value; 
        } 
      }
    });
  }

  public chooseDay(day) {
    if (this.task.days) {
      let ind = this.task.days.indexOf(day);
      (ind == -1) ? this.task.days.push(day) : this.task.days.splice(ind, 1);      
    } else {
      this.task.days = [day]; 
    } 
  }

  public cleanData() {
    this.task.days = null;
    this.spinnerDays = [1];
    this.calendarDays = [new Date()];
  }

  public taskSave() {
    (this.regularTask == "regular_task") ? this.task.regular = true : this.task.regular = false;

    this.task.dayForOnceTask = this.dayForOnceTask;
    this.task.project_id = this.project;

    switch(this.task.type){
      case "everyday":
        this.task.days = null;
        break;
      case "week":
        this.task.days = this.task.days;
        break;
      case "month":
        this.task.days = this.spinnerDays;
        break;
      case "year":
        this.task.days = this.calendarDays;
        break;
    }

    if (!this.task.regular) {
      this.task.type = null;
    }

    if (this.mode == "add") {
      this.userService.addTask(this.task, (result)=>{
        if (result.message == "ok") {
          this.resultTask.emit({"refresh": true});
        }
      });
    } else {
      
    }    
  }

  public discardChanges() {
    this.resultTask.emit({"refresh": false});
  }

  public pushDay(){
    let today = new Date();
    this.calendarDays.push(today);
  }

  public removeError() {
    if (this.taskName.nativeElement.classList.contains("error-field")) {
      this.taskName.nativeElement.classList.remove("error-field")
    }
    this.hasError = false;
  }
}

