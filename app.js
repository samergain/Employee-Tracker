//BASIC FUNCTIONALITIES:
// * Add departments, roles, employees
// * View departments, roles, employees
// * Update employee roles

const inquirer = require("inquirer");
const mysql = require("mysql");
//const { allowedNodeEnvironmentFlags } = require("process");
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "DansPassword",
    database: "employeesDB"
});

connection.connect(function(err){
    if(err) { throw err}
    console.log("connected to Employees DB.");
});

startApp();


function startApp() {
    inquirer.prompt(
        {
            name: "action",
            type: "list",
            message: "What's on your mind?",
            choices: [
                { name: "add",
                  message: "Add department/role/employee"},
                { name: "view",
                  message: "view department/role/employee"},
                { name: "update",
                  message: "update employee role"},
                { name: "exit",
                  message: "exit"}
            ]
        }
    )
    .then(function(answer){
        switch (answer.action) {
            case "add":
                add();
                break;
            case "view":
                view();
                break;
            case "update":
                update();
                break;
            case "exit":
                connection.end();
                process.exit();
                break;
        }
    });
}
//////////ADDING DATA///////////
function add() {
    inquirer.prompt(
        {
            name: "addOptions",
            type: "list",
            message: "What would you like to add?",
            choices: [
                {
                    name: "employee",
                    message: "employee"
                },
                {
                    name: "role",
                    message: "role"
                },
                {
                    name: "department",
                    message: "department"
                }
            ]
        }
    ).then(function(answer){
        switch (answer.addOptions) {
            case "employee":
                addEmployee();
                break;
            case "role":
                addRole();
                break;
            case "department":
                addDept();
                break;
            default: break;
        }
    });
}

function addDept() { 
    inquirer.prompt([
        {
            name: "depName",
            type: "input",
            message: "What's the name of your new department?"
        }
    ]).then(function(answer){
        connection.query("INSERT INTO department SET name=?",answer.depName,function(err){
            if (err) { throw err }
            console.log(`${answer.depName} department has been added to DB`);
            connection.end();
            startApp();
        });
    });    
}

function addRole(){
    connection.query("SELECT * FROM department", function(err,queryResults){
        if (err) { throw err }
        inquirer.prompt([
            {
                name: "roleName",
                type: "input",
                message: "What's the new role?"
            },
            {
                name: "roleSalary",
                type: "input",
                message: "What's the salary for the new role?"
            },
            {
                name: "roleDept",
                type: "list",
                message: "Under which department the new role is listed?",
                choices: function() {
                    let listOfDepts = [];
                    for(let i=0; i< queryResults.length; i++)
                    {listOfDepts.push(queryResults[i].name);}
                    return listOfDepts;
                }
            }
        ]).then(function(userAnswers){
            let deptID = 0;
            //get the chosen dept id and store it in deptID
            for(let i=0; i< queryResults.length; i++){
                if(queryResults[i].name === userAnswers.roleDept) {
                    deptID = queryResults[i].id;
                }
            }
            //now we have all the data needed to insert
            connection.query("INSERT INTO role SET ?", 
            {
                name: userAnswers.roleName,
                salary: userAnswers.roleSalary,
                department_id: deptID
            }, 
            function(err){
                if(err) { console.log(err) }
                else {
                    console.log(`${userAnswers.roleName} position has been added to DB.`);
                    startApp();
                }
            });
        }); 
    });
   
}

function addEmployee() {
    let empFirstName = "";
    let empLastName = "";
    let empRoleID = 0;
    let empManagerID = 0;
    connection.query("SELECT * FROM role", function(err,queryResults){
        if (err) { throw err }
        inquirer.prompt([
            {
                name: "firstName",
                type: "input",
                message: "What's the employee first name?"
            },
            {
                name: "lastName",
                type: "input",
                message: "What's the employee last name?"
            },
            {
                name: "role",
                type: "list",
                message: "What's the employee position?",
                choices: function() {
                    let listOfroles = [];
                    for(let i=0; i< queryResults.length; i++)
                    {listOfroles.push(queryResults[i].name);}
                    return listOfroles;
                }
            }
        ]).then(function(userAnswers){
            
            empFirstName = userAnswers.firstName;
            empLastName = userAnswers.lastName;
            //get the chosen dept id and store it in deptID
            for(let i=0; i< queryResults.length; i++){
                if(queryResults[i].name === userAnswers.role) {
                    empRoleID = queryResults[i].id;
                }
            }
            //now we have fName lName roleID, still need to assign a manager
            connection.query(
                "SELECT * FROM employee",
                function(err,result){
                    if(err) { throw err }
                    inquirer.prompt({
                        name: "setManager",
                        type: "list",
                        message: "Assign a manager to the new employee:",
                        choices: function() {
                            let listOfemployees = [];
                            for(let i=0; i< result.length; i++)
                            {listOfemployees.push(`${result[i].first_name} ${result[i].last_name}`);}
                            return listOfemployees;
                        }
                    }).then(function(answer){
                        let chosenAnswer = answer.setManager;
                        let fullName = chosenAnswer.split(" ");
                        console.log(fullName[0],"and the lastName is:",fullName[1]);
                        for(let i=0; i<result.length; i++) {
                            if(fullName[0] === result[i].first_name && fullName[1] === result[i].last_name) {
                                empManagerID = result[i].id;
                            }
                        }
                        //now we have all the employee info to push to DB
                        connection.query("INSERT INTO employee SET ?", 
                        {
                            first_name: empFirstName,
                            last_name: empLastName,
                            role_id: empRoleID,
                            manager_id: empManagerID
                        }, 
                        function(err){
                            if(err) { console.log(err) }
                            else {
                                console.log(`${empFirstName} ${empLastName} has been added to DB.`);
                                startApp();
                            }
                        });
                    });
                });
        }); 
    });
}

//////////VIEWING DATA///////////
function view() {
    inquirer.prompt(
        {
            name: "viewOptions",
            type: "list",
            message: "What would you like to view?",
            choices: [
                {
                    name: "employee",
                    message: "employees"
                },
                {
                    name: "role",
                    message: "roles"
                },
                {
                    name: "department",
                    message: "departments"
                }
            ]
        }
    ).then(function(answer){
        switch (answer.viewOptions) {
            case "employee":
                viewEmployees();
                break;
            case "role":
                viewRoles();
                break;
            case "department":
                viewDepartments();
                break;
            default: break;
        }
    });
}

function viewEmployees(){
        connection.query("select id,first_name,last_name from employee",function(err,result){
            if(err) { throw err }
            console.table(result);
            startApp();
        })
}
function viewDepartments() {
    connection.query("select * from department",function(err,result){
        if(err) { throw err }
        console.table(result);
        startApp();
    })
}

function viewRoles(){
    connection.query("select * from role",function(err,result){
        if(err) { throw err }
        console.table(result);
        startApp();
    })
}

//////////UPDATING ROLE//////////
function update() {
    let chosenEmpID = 0;
    let chosenRoleID = 0;
    //get chosenEmpID
    connection.query("SELECT * FROM employee",function(err,result){
        if(err) { throw err }
        inquirer.prompt(
            {
                name: "employee",
                type: "list",
                message: "Which employee has a new position?",
                choices: function() {
                    let listOfEmps = [];
                    for (let i=0; i<result.length; i++) {
                        listOfEmps.push(`${result[i].first_name} ${result[i].last_name}`);
                    }
                    return listOfEmps;
                }
            }
        ).then(function(answer){
            let fullName = answer.employee;
            let fullNameSplit = fullName.split(" ");
            console.log(fullNameSplit[0],"and the lastName is:",fullNameSplit[1]);
            for (let i=0; i<result.length; i++) {
                if(fullNameSplit[0] === result[i].first_name && fullNameSplit[1] === result[i].last_name) {
                    chosenEmpID = result[i].id;
                    console.log("employee id:", result[i].id);
                }
            }
            //get chosenEmpID
            connection.query("SELECT * FROM role",function(err,result){
                if(err) { throw err }
                inquirer.prompt(
                    {
                    name: "newRole",
                    type: "list",
                    message: "What's the new position?",
                    choices: function() {
                        let listOfRoles = [];
                        for (let i=0; i<result.length; i++) {
                            listOfRoles.push(result[i].name);
                        }
                        return listOfRoles;
                    }
                }).then(function(answer){
                    for (let i=0; i < result.length; i++) {
                        if (answer.newRole === result[i].name) {
                            chosenRoleID = result[i].id;
                        }
                    }
                    //update employee role
                    connection.query("UPDATE employee SET ? WHERE ?",
                    [
                        { role_id: chosenRoleID }, 
                        { id: chosenEmpID }
                    ],
                    function(err){
                        if(err) { throw err; }
                        console.log("New position updated"); 
                        startApp();
                    });
                });
            });        
        });
    });            
}
    