/*********************************************************************************
 * – Assignment 06
 * ********************************************************************************/
var express = require("express");
var app = express();
var dataService = require("./data-service.js");
var path = require("path");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const dataServiceComments = require("./data-service-comments.js");
var clientSessions = require("client-sessions");
const dataServiceAuth = require("./data-service-auth.js");

// Setup client-sessions
app.use(
  clientSessions({
    cookieName: "session", // this is the object name that will be added to 'req'
    secret: "web322_A7", // this should be a long un-guessable string.
    duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
    activeDuration: 1000 * 60 // the session will be extended by this many ms each request (1 minute)
  })
);

app.use(function(req, res, next) {
  res.locals.session = req.session;
  next();
});

function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
}

//const querystring = require('querystring');

var HTTP_PORT = process.env.PORT || 8080;

//NOTE:for your server to correctly return the "css/site.css" file
//the "static" middleware must be used: in yourserver.js file -->
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.engine(
  ".hbs",
  exphbs({
    extname: ".hbs",
    defaultLayout: "layout",
    helpers: {
      equal: function(lvalue, rvalue, options) {
        if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
          return options.inverse(this);
        } else {
          return options.fn(this);
        }
      }
    }
  })
);

app.set("view engine", ".hbs");

// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on: ".blue + HTTP_PORT);
}

// setup a 'route' to listen on the default url path (http://localhost)
//--Home
// **************************************************************REPLACED STARTING HERE
app.get("/", (req, res) => {
  res.render("home");
});

//--About
app.get("/about", (req, res) => {
  dataServiceComments
    .getAllComments()
    .then(data => {
      res.render("about", { data: data });
    })
    .catch(() => {
      res.render("about");
    });
});

//--getAllEmployees
app.get("/employees", ensureLogin, (req, res) => {
  if (req.query.status) {
    dataService
      .getEmployeesByStatus(req.query.status) //WORKS
      .then(statusArray => {
        //res.json(statusArray)
        res.render("employeeList", {
          data: statusArray,
          title: "Employees By Status"
        });
      })
      .catch(err => {
        //res.json({message: err});
        res.render("employeeList", { data: {}, title: "Employees By Status" });
      });
  } else if (req.query.department) {
    dataService
      .getEmployeesByDepartment(req.query.department) //DOSENT WORK
      .then(departmentsArray => {
        //res.json(departmentsArray);
        res.render("employeeList", {
          data: departmentsArray,
          title: "Employees By Department"
        });
      })
      .catch(err => {
        //res.json({message: err});
        res.render("employeeList", {
          data: {},
          title: "Employees By Department"
        });
      });
  } else if (req.query.manager) {
    dataService
      .getEmployeesByManager(req.query.manager)
      .then(managersArray => {
        //res.json(managersArray)
        res.render("employeeList", {
          data: managersArray,
          title: "Employees By Manager"
        });
      })
      .catch(err => {
        //res.json({message: err});
        res.render("employeeList", { data: {}, title: "Employees By Manager" });
      });
  } else {
    dataService
      .getAllEmployees()
      .then(employeeAll => {
        res.render("employeeList", { data: employeeAll, title: "Employees" });
      })
      .catch(err => {
        res.render("employeeList", { data: {}, title: "Employees" });
      });
  }
});

//--getEmployeeByNum
app.get("/employee/:employeeNum", ensureLogin, (req, res) => {
  dataService
    .getEmployeeByNum(req.params.employeeNum)
    .then(employeeNumObject => {
      res.render("employee", { data: employeeNumObject });
    })
    .catch(err => {
      res.status(404).send("Employee Not Found");
    });
});

//--getManagers
app.get("/managers", ensureLogin, (req, res) => {
  dataService
    .getManagers()
    .then(managersArray => {
      res.render("employeeList", {
        data: managersArray,
        title: "Employees (Managers)"
      });
    })
    .catch(err => {
      res.render("employeeList", { data: {}, title: "Employees (Managers)" });
    });
});

//--getDepartments
app.get("/departments", ensureLogin, (req, res) => {
  dataService
    .getDepartments()
    .then(departmentsAll => {
      //NOTE:res.jason() sends a JSON responce
      res.render("departmentList", {
        data: departmentsAll,
        title: "Departments"
      });
    })
    .catch(err => {
      res.render("departmentList", { data: {}, title: "Departments" });
    });
});

// app.get("/employees/add", (req,res) => {
//   res.render("addEmployee");
// });

app.get("/employees/add", ensureLogin, (req, res) => {
  dataService
    .getDepartments()
    .then(data => {
      res.render("addEmployee", { departments: data });
    })
    .catch(err => {
      res.render("addEmployee", { departments: [] });
    });
});

app.post("/employees/add", ensureLogin, (req, res) => {
  //should be like departments/add POST
  dataService
    .addEmployee(req.body)
    .then(employeeAll => {
      res.redirect("/employees");
    })
    .catch(err => {
      //do i need this???
      res.json({ message: err }); //do i need this???
    });
  res.redirect("/employees");
}); //do i need this???

app.get("/departments/add", ensureLogin, (req, res) => {
  res.render("addDepartment");
});

app.post("/departments/add", ensureLogin, (req, res) => {
  //should be like employees/add POST
  dataService.addDepartment(req.body).then(() => {
    res.redirect("/departments");
  });
});

app.post("/department/update", ensureLogin, (req, res) => {
  //should be like employees/update POST
  dataService
    .updateDepartment(req.body)
    .then(() => {
      res.redirect("/department");
    })
    .catch(() => {
      res.status(404).send("Error While Updating Department");
    });
});

app.get("/department/:departmentId", ensureLogin, (req, res) => {
  dataService
    .getDepartmentById(req.params.departmentId)
    .then(data => {
      res.render("department", { data: data });
    })
    .catch(err => {
      res.status(404).send("Department Not Found");
    });
});

//--employee/update
app.post("/employee/update", ensureLogin, (req, res) => {
  dataService
    .updateEmployee(req.body)
    .then(() => {
      res.redirect("/employees");
    })
    .catch(() => {
      res.status(404).send("Error While Updating Employee");
    });
});

app.get("/employee/:empNum", ensureLogin, (req, res) => {
  // initialize an empty object to store the values
  let viewData = {};
  dataService
    .getEmployeeByNum(req.params.empNum)
    .then(data => {
      viewData.data = data; //store employee data in the "viewData" object as "data"
    })
    .catch(() => {
      viewData.data = null; // set employee to null if there was an error
    })
    .then(dataService.getDepartments)
    .then(data => {
      viewData.departments = data; // store department data in the "viewData" object as "departments"
      // loop through viewData.departments and once we have found the departmentId that matches
      // the employee's "department" value, add a "selected" property to the matching
      // viewData.departments object
      for (let i = 0; i < viewData.departments.length; i++) {
        if (viewData.departments[i].departmentId == viewData.data.department) {
          viewData.departments[i].selected = true;
        }
      }
    })
    .catch(() => {
      viewData.departments = []; // set departments to empty if there was an error
    })
    .then(() => {
      if (viewData.data == null) {
        // if no employee - return an error
        res.status(404).send("Employee Not Found");
      } else {
        res.render("employee", { viewData: viewData }); // render the "employee" view
      }
    });
});

app.get("/employee/delete/:empNum", ensureLogin, (req, res) => {
  dataService
    .deleteEmployeeByNum(req.params.empNum)
    .then(() => {
      res.redirect("/employees");
    })
    .catch(err => {
      res.status(500).send("Unable to Remove Employee / Employee not found");
    });
});

app.post("/about/addComment", (req, res) => {
  dataServiceComments
    .addComment(req.body)
    .then(() => {
      res.redirect("/about");
    })
    .catch(() => {
      console.log(err);
      res.redirect("/about");
    });
});

app.post("/about/addReply", (req, res) => {
  dataServiceComments
    .addReply(req.body) //this not taking data from form
    .then(() => {
      res.redirect("/about");
    })
    .catch(() => {
      console.log(err);
      res.redirect("about");
    });
});

app.get("/login", (req, res) => {
  res.render("login", {});
});

app.get("/register", (req, res) => {
  res.render("register", {});
});

app.post("/register", (req, res) => {
  dataServiceAuth
    .registerUser(req.body)
    .then(() => {
      res.render("register", { successMessage: "User created" });
    })
    .catch(err => {
      res.render("register", { errorMessage: err, user: req.body.user });
    });
});

app.post("/login", (req, res) => {
  dataServiceAuth
    .checkUser(req.body)
    .then(() => {
      req.session.user = {
        username: req.body.user
      };
      res.redirect("/employees");
    })
    .catch(err => {
      res.render("login", { errorMessage: err, user: req.body.user });
    });
});

app.get("/logout", (req, res) => {
  req.session.reset();
  res.redirect("/");
});
//No matching route
app.use((req, res) => {
  res.status(404).send("Page Not Found");
});

dataService
  .initialize()
  .then(dataServiceComments.initialize)
  .then(dataServiceAuth.initialize)
  .then(() => {
    app.listen(HTTP_PORT, onHttpStart);
  })
  .catch(err => {
    console.log("unable to start the server: " + err);
  });
