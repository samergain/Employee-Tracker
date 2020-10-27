//BASIC FUNCTIONALITIES:
// * Add departments, roles, employees
// * View departments, roles, employees
// * Update employee roles
//BONUS FUNCTIONALITIES
// Update employee managers
// View employees by manager
// Delete departments, roles, and employees

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
                "Add department/role/employee",
                "View department/role/employee",
                "Update employee role",
                "Update employee manager",
                "Delete Employee/Role/Department",
                "Exit"
            ]
        }
    )
    .then(function(answer){
        switch (answer.action) {
            case "Add department/role/employee":
                add();
                break;
            case "View department/role/employee":
                view();
                break;
            case "Update employee role":
                updateRole();
                break;
            case "Update employee manager":
                updateManager();
                break;
            case "Delete Employee/Role/Department":
                deleteData();
                break;
            case "Exit":
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
                "Employee",
                "Role",
                "Department"
            ]
        }
    ).then(function(answer){
        switch (answer.addOptions) {
            case "Employee":
                addEmployee();
                break;
            case "Role":
                addRole();
                break;
            case "Department":
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
                "Employees",
                "Employees By Manager",
                "Roles",
                "Departments"
            ]
        }
    ).then(function(answer){
        switch (answer.viewOptions) {
            case "Employees":
                viewEmployees();
                break;
            case "Employees By Manager":
                viewEmployeesByManager();
                break;
            case "Roles":
                viewRoles();
                break;
            case "Departments":
                viewDepartments();
                break;
            default: break;
        }
    });
}
function viewEmployees(){
        connection.query(`select employee.first_name,employee.last_name, role.name Role, department.name Department
        from employee,role,department
        where employee.role_id = role.id and role.department_id = department.id`,function(err,result){
            if(err) { throw err }
            console.table(result);
            startApp();
        })
}
function viewEmployeesByManager() {
    let managersQuery = `select CONCAT(e.first_name," ",e.last_name) as Employee_Name , CONCAT(m.first_name," ",m.last_name) as Employee_Manager
    from employee e, employee m
    where e.manager_id = m.id order by Employee_Manager`;
    connection.query(managersQuery,function(err,result){
        if(err) { throw err }
        console.table(result);
        startApp();
    });

}
function viewDepartments() {
    connection.query("select name Department from department",function(err,result){
        if(err) { throw err }
        console.table(result);
        startApp();
    })
}
function viewRoles(){
    connection.query(`select role.name Title, role.salary, department.name Department from role 
    inner join department on role.department_id = department.id`,function(err,result){
        if(err) { throw err }
        console.table(result);
        startApp();
    })
}
//////////UPDATING ROLE//////////
function updateRole() {
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

function updateManager() {
    let chosenEmpID = 0;
    let chosenManagerID = 0;
    //get chosenEmpID
    connection.query("SELECT * FROM employee",function(err,result){
        if(err) { throw err }
        inquirer.prompt(
            {
                name: "employee",
                type: "list",
                message: "Which employee has a new manager?",
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
            
            for (let i=0; i<result.length; i++) {
                if(fullNameSplit[0] === result[i].first_name && fullNameSplit[1] === result[i].last_name) {
                    chosenEmpID = result[i].id;
                }
            }
            //get chosenManagerID
                inquirer.prompt(
                    {
                    name: "newManager",
                    type: "list",
                    message: "Who's the new manager?",
                    choices: function() {
                        let listOfEmps = [];
                        for (let i=0; i<result.length; i++) {
                            listOfEmps.push(`${result[i].first_name} ${result[i].last_name}`);
                        }
                        return listOfEmps;
                    }
                }).then(function(answer){
                    let fullName = answer.newManager;
                    let fullNameSplit = fullName.split(" ");
                    for (let i=0; i<result.length; i++) {
                        if(fullNameSplit[0] === result[i].first_name && fullNameSplit[1] === result[i].last_name) {
                            chosenManagerID = result[i].id;
                        }
                    }
                    //update employee Manager
                    connection.query("UPDATE employee SET ? WHERE ?",
                    [
                        { manager_id: chosenManagerID }, 
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
            
}

//////////DELETE DATA///////////
function deleteData() {
    inquirer.prompt(
        {
            name: "deleteOptions",
            type: "list",
            message: "What would you like to delete?",
            choices: [
                "Employee",
                "Role",
                "Department"
            ]
        }
    ).then(function(answer){
        switch (answer.deleteOptions) {
            case "Employee":
                deleteEmployee();
                break;
            case "Role":
                deleteRole();
                break;
            case "Department":
                deleteDept();
                break;
            default: break;
        }
    });
}
function deleteEmployee() {
    let chosenEmpID = 0;
    //get chosenEmpID
    connection.query("SELECT * FROM employee",function(err,result){
        if(err) { throw err }
        inquirer.prompt(
            {
                name: "employee",
                type: "list",
                message: "Which employee you want to delete?",
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
            for (let i=0; i<result.length; i++) {
                if(fullNameSplit[0] === result[i].first_name && fullNameSplit[1] === result[i].last_name) {
                    chosenEmpID = result[i].id;
                }
            }
            //get chosenEmpID
            connection.query("DELETE FROM employee WHERE id = ?",chosenEmpID, function(err){
                if(err) { throw err }
                console.log(fullName, "has been deleted.");
                startApp();
            });
        });
    });
}

function deleteRole() {
    let chosenRoleID = 0;
    //get chosenRoleID
    connection.query("SELECT * FROM role",function(err,result){
        if(err) { throw err }
        inquirer.prompt(
            {
                name: "role",
                type: "list",
                message: "Which role you want to delete?",
                choices: function() {
                    let listOfRoles = [];
                    for (let i=0; i<result.length; i++) {
                        listOfRoles.push(result[i].name);
                    }
                    return listOfRoles;
                }
            }
        ).then(function(answer){
            let roleName = answer.role;
            for (let i=0; i<result.length; i++) {
                if(roleName === result[i].name) {
                    chosenRoleID = result[i].id;
                }
            }
            //delete chosenRoleID
            connection.query("DELETE FROM role WHERE id = ?",chosenRoleID, function(err){
                if(err) { throw err }
                console.log(roleName, "has been deleted.");
                startApp();
            });
        });
    });
}

function deleteDept() {
    let chosenDeptID = 0;
    //get chosenRoleID
    connection.query("SELECT * FROM department",function(err,result){
        if(err) { throw err }
        inquirer.prompt(
            {
                name: "dept",
                type: "list",
                message: "Which department you want to delete?",
                choices: function() {
                    let listOfDepts = [];
                    for (let i=0; i<result.length; i++) {
                        listOfDepts.push(result[i].name);
                    }
                    return listOfDepts;
                }
            }
        ).then(function(answer){
            let deptName = answer.dept;
            for (let i=0; i<result.length; i++) {
                if(deptName === result[i].name) {
                    chosenDeptID = result[i].id;
                }
            }
            //delete chosenRoleID
            connection.query("DELETE FROM department WHERE id = ?",chosenDeptID, function(err){
                if(err) { throw err }
                console.log(deptName, "has been deleted.");
                startApp();
            });
        });
    });
}