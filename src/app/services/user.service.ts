import { Injectable, Optional, Inject } from '@angular/core';
import { Headers, Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';

import { Settings } from './settings';

export class User {
	public username: string = null;
    public password: string = null;
    public isLogged: Boolean = false;
}

export class Task {
  public name: string;
  public project_id: string;
  public regular: Boolean;
  public dayForOnceTask: Date;
  public type: string; // everyday, week, month, year
  public days: any[]; // null, M-S, 1-31, Date
}

@Injectable()
export class UserService {
    private headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
    public settings: Settings = new Settings();

    constructor(private http: Http) {}

    public returnGet(pathQuery, success){
        return this.http
        .get(this.settings.baseUrl + pathQuery, { headers: this.headers })
        .toPromise()
        .then((res: any) => {
            success(JSON.parse(res._body));
        })
        .catch((error: any) => {
            console.log(error);
        });
    }

    public checkUser(user: User, success: ((result: any) => void), fail: (() => void)) {
        let pathQuery = "getUser/" + user.username;

        return this.returnGet(pathQuery, success);
    }

    public addUser(user: User, success: ((result: any) => void), fail: ((data: string) => void)) {
        let pathQuery = "addUser";
        let body = "username=" + user.username + "&password=" + user.password;
        
        return this.http
			.post(this.settings.baseUrl + pathQuery, body, { headers: this.headers })
			.toPromise()
			.then((res: any) => {
                success(JSON.parse(res._body));
			})
			.catch((error: any) => {
				console.log(error);
			});
    }

    public checkPassword(user: User, success: ((result: any) => void)) {
        let pathQuery = "checkPassword/" + user.username + "/" + user.password;

        return this.returnGet(pathQuery, success);
    }

    public getProjects(user: User, success: ((result: any) => void)) {
        let pathQuery = "getProjects/" + user.username;

        return this.returnGet(pathQuery, success);
    }

    public addProject(username: string, projectName: string, success: ((result: any) => void)) {
        let pathQuery = "addProject";
        let body = "projectname=" + projectName + "&username=" + username;

        return this.http
			.post(this.settings.baseUrl + pathQuery, body, { headers: this.headers })
			.toPromise()
			.then((res: any) => {
                success(JSON.parse(res._body));
			})
			.catch((error: any) => {
				console.log(error);
			});
    }

    public editProject(projectId: string, projectName: string, success: ((result: any) => void)) {
        let pathQuery = "editProject";
        let body = "projectname=" + projectName + "&project_id=" + projectId;

        return this.http
            .post(this.settings.baseUrl + pathQuery, body, { headers: this.headers })
            .toPromise()
            .then((res: any) => {
                success(JSON.parse(res._body));
            })
            .catch((error: any) => {
                console.log(error);
            });
    }

    public removeProject(projectId: string, success: ((result: any) => void)) {
        let pathQuery = "removeProject/" + projectId;
        
        return this.returnGet(pathQuery, success);
    }

    public addTask(task: Task, success: ((result: any) => void)) {
        let pathQuery = "addTask";
        let arr = [];
        for (let key in task) {
            if (task.hasOwnProperty(key)) {
                arr.push(key+"="+task[key]);
            }
        }
                 
        let body = arr.join("&");

        return this.http
			.post(this.settings.baseUrl + pathQuery, body, { headers: this.headers })
			.toPromise()
			.then((res: any) => {
                success(JSON.parse(res._body));
			})
			.catch((error: any) => {
				console.log(error);
			});
    }

    public getTasks(username: string, project_id: string, date: Date, success: ((result: any) => void)) {
        let pathQuery = "getTasksList/" + username + "/" + project_id + "/" + date;

        return this.returnGet(pathQuery, success);
    }

    public completeTask(task_id: string, success: ((result: any) => void)) {
        let pathQuery = "completeTask/" + task_id;

        return this.returnGet(pathQuery, success);
    }

    public removeTask(task_id: string, success: ((result: any) => void)){
        let pathQuery = "removeTask/" + task_id;
        
        return this.returnGet(pathQuery, success);
    }

    public getTaskProgress(user: User, success: ((result: any) => void)) {
        let pathQuery = "getTaskProgress/" + user.username;

        return this.returnGet(pathQuery, success);
    }


}