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
    connectDB();
    inquirer.prompt([
        {
            name: "depName",
            type: "input",
            message: "What's the name of your new department?"
        }
    ]).then(function(answer){
        connection.query("INSERT INTO department SET name=?",answer.depName,function(err){
            if (err) { throw err }
            console.log(`${answer.depName} has been added to DB`);
        });
        connection.end();
        startApp();
    });
}

function addRole(){
   
}

function addEmployee() {

}