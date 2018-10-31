const Sequelize = require("sequelize");
var colors = require("colors");

var sequelize = new Sequelize("dbnpsi6j8ner5f", "sdsdyimeygaohw", "###", {
  host: "###-##-##-##-##.compute-1.amazonaws.com",
  dialect: "postgres",
  port: 5432,
  dialectOptions: {
    ssl: true
  }
});

//->creat model/table "Employee" with constraints
var Employee = sequelize.define("Employee", {
  employeeNum: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  firstName: Sequelize.STRING,
  last_name: Sequelize.STRING,
  email: Sequelize.STRING,
  SSN: Sequelize.STRING,
  addressStreet: Sequelize.STRING,
  addressCity: Sequelize.STRING,
  addressState: Sequelize.STRING,
  addressPostal: Sequelize.STRING,
  mariralStatus: Sequelize.STRING,
  isManager: Sequelize.BOOLEAN,
  employeeManagerNum: Sequelize.INTEGER,
  status: Sequelize.STRING,
  department: Sequelize.INTEGER,
  hireDate: Sequelize.STRING
});

//->creat model/table "Department" with constraints
var Department = sequelize.define("Department", {
  departmentId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  departmentName: Sequelize.STRING
});

//->DONE
module.exports.initialize = function() {
  return new Promise(function(resolve, reject) {
    sequelize
      .sync()
      .then(() => {
        console.log("Successfully Connected to the Database".blue);
        resolve();
      })
      .catch(() => {
        reject("Unable to sync the database");
      });
    //reject();
  });
};
//-->/employees
module.exports.getAllEmployees = function() {
  return new Promise(function(resolve, reject) {
    Employee.findAll()
      .then(data => {
        //was returning getAllEmployees
        resolve(data);
      })
      .catch(err => {
        reject("no results returned");
      });
  }); //end of promise
};

//->/employees?status=value
module.exports.getEmployeesByStatus = status => {
  return new Promise((resolve, reject) => {
    Employee.findAll({
      where: {
        status: status
      }
    })
      .then(data => {
        console.log("Department data returned after findAll".yellow + data);
        resolve(data);
      })
      .catch(err => {
        reject("no results returned");
      });
  }); //end of promise
};

//->/employees?department=value
module.exports.getEmployeesByDepartment = department => {
  //console.log(department + "department before findall".yellow);
  return new Promise((resolve, reject) => {
    Employee.findAll({ where: { department: department } })
      .then(data => {
        //console.log("Department data returned after findAll".yellow + data);
        resolve(data);
      })
      .catch(err => {
        reject("no results returned");
      });
  }); //end of promise
};

//->/employees?manager=value
module.exports.getEmployeesByManager = function(manager) {
  return new Promise(function(resolve, reject) {
    Employee.findAll({
      where: {
        employeeManagerNum: manager
      }
    })
      .then(data => {
        resolve(data);
      })
      .catch(() => {
        reject("no results returned");
      });
  }); //end of promise
};

//->/employee/value
module.exports.getEmployeeByNum = num => {
  return new Promise(function(resolve, reject) {
    Employee.findAll({
      where: {
        employeeNum: num
      }
    })
      .then(data => {
        resolve(data[0]);
      })
      .catch(err => {
        reject("no results returned");
      });
  }); //end of promise
};

//->/managers
module.exports.getManagers = () => {
  return new Promise(function(resolve, reject) {
    Employee.findAll({
      where: {
        isManager: true
      }
    })
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject("no results returned");
      });
  }); //end of promise
};

//->/departments
module.exports.getDepartments = () => {
  return new Promise((resolve, reject) => {
    Department.findAll()
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject("no results returned");
      });
  }); //end of promise
};

//->/addEmployee
module.exports.addEmployee = employeeData => {
  return new Promise((resolve, reject) => {
    employeeData.isManager = employeeData.isManager ? true : false;
    for (var prop in employeeData) {
      if (employeeData[prop] == "") {
        employeeData[prop] = null;
      }
    }
    Employee.create(employeeData)
      .then(() => {
        resolve();
      })
      .catch(err => {
        reject("unable to create employee");
      });
  }); //end of promise
};

//->/updateEmployee
module.exports.updateEmployee = employeeData => {
  return new Promise((resolve, reject) => {
    employeeData.isManager = employeeData.isManager ? true : false;
    for (var prop in employeeData) {
      if (employeeData[prop] == "") {
        employeeData[prop] = null;
      }
    }
    Employee.update(employeeData, {
      where: {
        employeeNum: employeeData.employeeNum
      }
    })
      .then(() => {
        //console.log("Employee Updated");
        resolve();
      })
      .catch(err => {
        reject("unable to create employee");
      }); //end of promise
  });
};

module.exports.deleteEmployeeByNum = empnum => {
  return new Promise((resolve, reject) => {
    Employee.destroy({
      where: {
        employeeNum: empnum
      }
    })
      .then(() => {
        resolve();
      })
      .catch(err => {
        reject("Unable to Remove Employee/Employee not found");
      });
  });
};

module.exports.addDepartment = departmentData => {
  return new Promise((resolve, reject) => {
    for (var prop in departmentData) {
      if (departmentData[prop] == "") {
        departmentData[prop] = null;
      }
    }
    Department.create(departmentData)
      .then(() => {
        //console.log("Department Created");
        resolve();
      })
      .catch(() => {
        reject("unable to create department");
      });
  }); //end of promise
};
module.exports.updateDepartment = departmentData => {
  return new Promise((resolve, reject) => {
    for (var prop in departmentData) {
      if (departmentData[prop] == "") {
        departmentData[prop] = null;
      }
    }
    Department.update(departmentData, {
      where: {
        departmentId: departmentData.departmentId
      }
    })
      .then(() => {
        //console.log("Department Updated");
        resolve();
      })
      .catch(err => {
        reject("unable to update department");
      });
  }); //end of promise
};

module.exports.getDepartmentById = function(id) {
  return new Promise((resolve, reject) => {
    Department.findAll({
      where: {
        departmentId: id
      }
    })
      .then(data => {
        //was returning departmentById
        resolve(data[0]);
      })
      .catch(() => {
        reject("no results returned");
      });
  });
};
