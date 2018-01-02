var crypto = require('crypto');
var async = require('async');
var mongoose = require('../libs/mongoose'),
    Schema = mongoose.Schema;

// User
var userSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    hashedPassword: {
        type: String,
        required: true
    },
    salt: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    }
});

userSchema.methods.encryptPassword = function(password) {
    return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
};
userSchema.virtual('password')
    .set(function(password){
        this._plainPassword = password;
        this.salt = Math.random() + '';
        this.hashedPassword = this.encryptPassword(password);
    }) 
    .get(function() {
        return this._plainPassword;
    })

userSchema.methods.checkPassword = function(password) {
    return this.encryptPassword(password) == this.hashedPassword;
}

var User = mongoose.model('User', userSchema);

function getUserByName(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*'); 
    User.findOne({username: req.params.name}, function (err, user) {
      if (err) {
        next(err);
      } else {
        res.end(JSON.stringify(user));
      }
    });
}

function checkUserPassword(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*'); 
    async.waterfall([
        function(callback) {
            User.findOne({username: req.params.name}, callback);
        },
        function(user, callback) {
            if (user) {
                if (user.checkPassword(req.params.password)) {
                    callback(null, true, user);
                } else {
                    callback(null, false, user);
                }
            } else {
                callback(null, "There is no user with this name");
            }  
        }
    ], function(err, result, user) {
        if (err) return next(err);
        if (user)
            req.session.user = user._id;
        
        res.send({result: result});
    });
}

function addUser(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*'); 
    var username = req.body.username;
    var password = req.body.password;
    var user = new User({username: username, password: password});
    user.save(function(err){
        if (err) return next(err);
        res.send(user); 
    })
}

// Project
var projectSchema = new Schema({
    id_user: {
        type: String,
        required: true
    }, 
    name: {
        type: String,
        required: true
    }
});

var Project = mongoose.model('Project', projectSchema);

function getProjects(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*'); 
    var userName = req.params.name;
    async.waterfall([
        function(callback) {
            User.findOne({username: req.params.name}, callback);
        },
        function(user, callback) {
            if (user) {
                Project.find({id_user: user._id}, function(err, projects){
                   if (projects.length > 0) {
                        callback(null, projects, "ok")
                   } else {
                        var project = new Project({id_user: user._id, name: "Main project"});
                        project.save(function(err){
                            callback(null, [project], "ok");
                        })
                    }
                });
            } else {
                callback(null, null, "There is no user with this name");
            }  
        }
    ], function(err, projects, message) {
        if (err) return next(err);       
        res.send({
            projects: projects,
            message: message
        });
    });
}

function addProject(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*'); 
    var projectname = req.body.projectname;
    var username = req.body.username;
    User.findOne({username: username}, function(err, user) {
        if (err) next(err);
        if (user) {
            var project = new Project({id_user: user._id, name: projectname});
            project.save(function(err){
                if (err) next(err);
                res.send({ project: project, message: "ok" });
            })
        } else {
            res.send({ project: null, message: "user is not found" });
        }
    });
    
}

function editProject(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*'); 
    var projectname = req.body.projectname;
    var project_id = req.body.project_id;

    Project.findOne({ _id: project_id }, function (err, project){
        if (err) next(err);
        project.name = projectname;
        project.save(function(err){
            if (err) next(err);
            res.send({ project: project, message: "ok" });
        });
    });
}

// Task
var taskSchema = new Schema({
    name: {
        type: String,
        required: true
    }, 
    project_id: {
        type: String,
        required: true
    }, 
    regular: {
        type: Boolean,
        required: true
    },
    dayForOnceTask: {
        type: Date
    },
    type: String,
    days: []
});

var Task = mongoose.model('Task', taskSchema);

function addTask(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*'); 
    var task = new Task({
        type: req.body.type,
        name: req.body.name, 
        regular: req.body.regular,
        dayForOnceTask: req.body.dayForOnceTask,
        project_id: req.body.project_id, 
        days: req.body.days
    });
    
    task.save(function(err){
        if (err) next(err);
        res.send({ message: "ok" });
    });
}

function editTask(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*'); 
    var taskId = req.body.task_id;

    Task.findOne({ _id: taskId }, function (err, task){
        if (err) next(err);
        task.name = req.body.name;
        task.project_id = req.body.project_id;
        task.regular = req.body.regular;
        task.dayForOnceTask = req.body.dayForOnceTask;        
        task.type = req.body.type;
        task.days = req.body.days;

        task.save(function(err){
            if (err) next(err);
            res.send({ task: task, message: "ok" });
        });
    });
}

function removeTask(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*'); 
    var task_id = req.params.task_id;
    Task.findOne({ _id: task_id }, function (err, task){
        if (err) next(err);
        task.remove(function(err){
            if (err) next(err);
            res.send({result: "ok"});
        });
    });  
}

function removeProject(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*'); 
    var project_id = req.params.project_id;
    Project.findOne({ _id: project_id }, function(err, project){
        if (err) next(err);
        if (project) {
            Task.findOne({ project_id: project._id}, function(err, task) {
                if (err) next(err);
                if (task) {
                    res.send({result: "task"})
                } else {
                    
                    project.remove(function(err){
                        if (err) next(err);
                        res.send({result: "ok"});
                    });
                }
            })
        } else {
            res.send({result: "There is no project with this id"}); 
        }
    });  
}

function removeProjectAndTasks(req, res, next) {
    var project_id = req.params.project_id;
    Project.findOne({ _id: project_id }, function(err, project){
        if (err) next(err);
        if (project) {
            Task.find({ project_id: project._id}, function(err, tasks) {
                if (err) next(err);
                if (tasks) {
                    async.each(tasks, function(indexItem, callback){
                        indexItem.remove(function(err){
                            if (err) next(err);
                        });  
                    }, function(err){
                        if(err){
                            res.send({result: "error with deleting task"});
                        } else {
                            res.send({result: "ok"});
                        }
                    })

                } else {
                    project.remove(function(err){
                        if (err) next(err);
                        res.send({result: "ok"});
                    });
                }
            })
        } else {
            res.send({result: "There is no project with this id"}); 
        }
    }); 
}

var resultTask = [];

function getTasksByProject(project_id, date, res, lastPart) {
    var choosenDate = (date.toString()).split(" ").slice(0, 4).join(" ");

    Task.find({project_id: project_id}, function (err, tasks) {
        if (err) next(err);
        var month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        for(var i=0, max=tasks.length; i < max; i ++) {
            var taskDate = (tasks[i].dayForOnceTask.toString()).split(" ").slice(0, 4).join(" ");
            if (tasks[i].regular == false && taskDate == choosenDate) { 
                resultTask.push(tasks[i]);
                continue;
            }
            var showTask = false;
            if (taskDate.split(" ")[3] <= choosenDate.split(" ")[3] &&
                month.indexOf(taskDate.split(" ")[1]) <= month.indexOf(choosenDate.split(" ")[1]) &&
                taskDate.split(" ")[2] <= choosenDate.split(" ")[2]) {
                    showTask = true;
            } else {
                showTask = false;
            }
            if (tasks[i].regular == true && showTask) {
                switch(tasks[i].type) {
                    case "everyday":
                        resultTask.push(tasks[i]);
                        break;
                    case "week":
                        var d = new Date(date);
                        var weekDay = d.getDay();
                        if (tasks[i].days.indexOf(weekDay) != -1)
                            resultTask.push(tasks[i]);       
                        break;
                    case "month":
                        var dM = new Date(date);
                        var monthDay = dM.getDate();
                        if (tasks[i].days.indexOf(monthDay) != -1)
                            resultTask.push(tasks[i]);
                        break;
                    case "year":
                        if (tasks[i].days.indexOf(date) != -1)
                            resultTask.push(tasks[i]);
                        break;
                }
            }
        }

        if (lastPart == true) {
            res.send(resultTask);
        }
    })
}

function getTasksList(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*'); 
    resultTask = [];    
    if (req.params.project_id == "any") { 
        User.findOne({username: req.params.username}, function(err, user) {
            if (err) next(err);
            Project.find({id_user: user._id}, function(err, projects){
                if (err) next(err);
                for(var j = 0, maxx=projects.length; j< maxx; j++) {
                        if (j == (maxx - 1)) {
                            // console.log(projects[j].project_id);
                            getTasksByProject(projects[j]._id, req.params.date, res, true); 
                        } else {
                            getTasksByProject(projects[j]._id, req.params.date, res, false); 
                        }               
                    }   
            });
        })
        
    } else {
        getTasksByProject(req.params.project_id, req.params.date, res, true); 
    }
}


var completedTask = new Schema({
    task_id: {
        type: String,
        required: true
    },
    daysComplete: Number
});

var CompletedTask = mongoose.model('CompletedTask', completedTask);

function completeTask(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*'); 
    var task_id = req.params.task_id;
    CompletedTask.findOne({ task_id: task_id }, function (err, task){
        if (err) next(err);
        if (task) {
            task.daysComplete = task.daysComplete + 1;
        } else {
            task = new CompletedTask({
                task_id: req.params.task_id,
                daysComplete: 1
            });
        }
        task.save(function(err){
            if (err) next(err);
            res.send({message: "ok"});
        });
    });
}

function getTaskProgress(req, res, next){
    res.header('Access-Control-Allow-Origin', '*'); 
    var userName = req.params.name;
    async.waterfall([
        function(callback) {
            User.findOne({username: req.params.name}, function(err, user){
                if (err) next(err);
                callback(null, user)
            });
        },
        function(user, callback) {
            if (user) {
                Project.find({id_user: user._id}, function(err, projects){
                    if (projects.length > 0) {
                        callback(null, projects)
                    } else {
                        callback(true, [], "no projects")  
                     }
                });
            } else {
                callback(true, [], "no user")
            }
        },
        function(projects, callback) {
            var tt = [];
            async.each(projects, function(project, callback){
                Task.find({project_id: project._id, regular: true}, function(err, tasks){
                    if (tasks) {
                        tt = tt.concat(tasks);
                    }
                    callback();
                })
            }, function(err){
                if(err){
                    callback(true, [], "err with tasks")
                } else {
                    callback(null, tt);
                }
            })
        },
        function(tasks, callback) {
            var resArr=[];
            async.each(tasks, function(task, callback){
                CompletedTask.findOne({task_id: task._id}, function(err, tk){
                    if (tk) {
                        resArr.push({name: task.name, count: tk.daysComplete})
                    }
                    callback();
                })
            }, function(err){
                if (err) {
                    callback(true, [], "err with complete tasks")
                } else {
                    callback(null, resArr, "ok")
                }
            })
        }
    ], function(err, arr, message){
   
        res.send({
            arr: arr,
            message: message
        });
    });
   
}

module.exports = {
    getUserByName: getUserByName,
    checkUserPassword: checkUserPassword,
    addUser: addUser,

    getProjects: getProjects,
    addProject: addProject,
    editProject: editProject,
    removeProject: removeProject,
    removeProjectAndTasks: removeProjectAndTasks,

    addTask: addTask,
    editTask: editTask,
    removeTask: removeTask,
    getTasksList: getTasksList,
    completeTask: completeTask,
    getTaskProgress: getTaskProgress
}

