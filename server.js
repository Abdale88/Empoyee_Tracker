const inquirer = require('inquirer');
const mysql = require('mysql');
const cTable = require('console.table');
const asciiart = require('asciiart-logo');


const connection = mysql.createConnection({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: 'password',
    database: 'employee_tracker'
})

const startQuestions = () => {
    inquirer
        .prompt({
            name: 'action',
            type: 'rawlist',
            message: 'What would you like to do?',
            choices: [
                'Add Employee',
                'Add Role',
                'Add Department',
                'View All Employees',
                'View All Roles',
                'View All Departments',
                'Update Employee Role',
                'Quit',
            ],
        })
        .then((answer) => {
            // console.log('here  answer ', answer);
            // console.log('here  answer.action ', answer.action);
            switch (answer.action) {
                case 'Add Employee':
                    addEmployee();
                    break;
                case 'Add Role':
                    addRole();
                    break;

                case 'Add Department':
                    addDepartment();
                    break;

                case 'View All Employees':
                    viewEmployees();
                    break;

                case 'View All Roles':
                    viewRoles();
                    break;

                case 'View All Departments':
                     viewAllDepartments();
                    break;

                case 'Update Employee Role':
                    updateEmployeeRole();
                    break;

                    case 'Quit':
                     console.log('Goodbye!!');
                     break;

                default:
                    console.log(`Invalid action: ${answer.action}`);
                    break;
            }
        });
}

const addEmployee = () => {
    connection.query('SELECT title FROM role', (err, res) => {
        if (err) throw err;
        inquirer
            .prompt([
                {
                    name: 'firstName',
                    type: 'input',
                    message: "What is the employee's first name?"
                },
                {
                    name: 'lastName',
                    type: 'input',
                    message: "What is the employee's last name?"
                },
                {
                    name: 'role',
                    type: 'rawlist',
                    message: "What is the employee's role?",
                    choices() {
                        const titleArray = [];

                        res.forEach(({ title }) => {
                            titleArray.push(title);

                        });
                        return titleArray;
                    }
                },
            ])
            .then((answer) => {
                connection.query('SELECT id FROM role WHERE ?', { title: answer.role }, (err, res) => {
                    let [{ id }] = res;
                    let roleId = id;

                    connection.query('SELECT first_name, last_name FROM employee WHERE manager_id IS NULL', (err, res) => {
                        if (err) throw err;
                        inquirer.prompt([
                     
                            {
                                name: 'manager',
                                type: 'rawlist',
                                message: "What is the employee's manager?",
                                choices() {
                                    const arrOfObj = [];
                                    res.forEach(({first_name, last_name}) => {
                                        arrOfObj.push(first_name);
                                    });
                                    arrOfObj.push('None')
                                    return (arrOfObj);
                                }
                            },
                        ])
                        .then((newAnswer) => {
                            connection.query('SELECT id FROM employee WHERE ?', {first_name: newAnswer.manager}, (err, managerRes) =>{
                             
                              if (err) throw err;
                                if (newAnswer.manager === 'None'){
                                    connection.query(
                                        'INSERT INTO employee SET ?',
                                        {
                                            first_name: answer.firstName,
                                            last_name: answer.lastName,
                                            role_id: roleId,
                                        },
                                        (err) => {
                                            if (err) throw err;
                                            console.log('You added a manager successfully to your database!');
                                            startQuestions();
                                        }
                                    );
                                }
                                else{
                                    let [{id}] = managerRes;
                                    let managerId = id;
                                    connection.query(
                                        'INSERT INTO employee SET ?',
                                        {
                                            first_name: answer.firstName,
                                            last_name: answer.lastName,
                                            role_id: roleId,
                                            manager_id: managerId,
                                        },
                
                                        (err) => {
                                            if (err) throw err;
                                            console.log('You added an employee successfully!');
                                            startQuestions();
                                        }
                                    );
                                }
                            })

                        }) 
                    })
                });
            });


    });

};


connection.connect((err, res) => {
    if (err) throw err;
    startQuestions();
})
