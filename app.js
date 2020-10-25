//BASIC FUNCTIONALITIES:
// * Add departments, roles, employees
// * View departments, roles, employees
// * Update employee roles

const inquirer = require("inquirer");
const mysql = require("mysql");
const { allowedNodeEnvironmentFlags } = require("process");
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "DansPassword",
    database: "employeesDB"
});
connectDB();
startApp();

function connectDB(){
        connection.connect(function(err){
            if(err) { throw err}
            console.log("connected to Employees DB.");
        });     
}

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

}

