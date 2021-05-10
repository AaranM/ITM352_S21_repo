// server structure from getting started assignment2 screencast and lab13-14
var express = require('express');
var app = express();
var myParser = require("body-parser");
app.use(myParser.urlencoded({ extended: true }));
var qs = require('qs');
var fs = require('fs');
var user_data = require('./public/products_data.js'); // Pulls the data from products.js and sets it in a variable called data
var user_data_file = './user_data.json'
//user_data = require('./user_data.json');
// Read user data file

if(fs.existsSync(user_data_file)) {
    var file_stats = fs.statSync(user_data_file);
    console.log(`${user_data_file} has ${file_stats['size']} characters`);
    user_data = JSON.parse(fs.readFileSync(user_data_file, 'utf-8'));
} else {
    console.log(`${user_data_file} does not exist`);
}

app.all('*', function (request, response, next) {
    console.log(request.method + ' to path ' + request.path + ' with query' + JSON.stringify(request.query));
    next(); // Go onto next route
});

app.post("/process_order", function (request, response) {
    let user_quantity_data = request.body;
    const stringified = qs.stringify(user_quantity_data);
    // If statement created to determine whether or not values are positive.
    if (typeof user_quantity_data['purchase_submit'] != 'undefined') {
        has_errors = false; //assume quantities are valid from the start
            total_qty = 0; //need to check if something was selected so we will look if the total > 0
        for (i = 0; i < products.length; i++) {
            if (user_quantity_data[`quantity${i}`] != 'undefined') {
                a_qty = user_quantity_data[`quantity${i}`];
                total_qty += a_qty;
                if (!isNonNegInt(a_qty)) {
                    has_errors = true; // oops, invalid quantity
                }
            }
        }
        // Now respond to errors or redirect to login if all is ok
        if (has_errors || total_qty == 0) {
            response.redirect('./products_display.html?' + qs.stringify(user_quantity_data));
            return;
        } else { // all good to go!
            response.redirect('./login.html?' + qs.stringify(user_quantity_data));
        }
        //response.redirect("/login.html?" + stringified); // This will use the login.html file
    }
    });

// This processed the form from order_page.html
app.post('/process_login', function (request, response, next) { // set path location to test
    console.log(request.body);
    let username_entered = request.body['uname'];
    let password_entered = request.body['psw'];
    var errors = [];
    if(typeof user_data[username_entered] != 'undefined'){
        if(user_data[username_entered]['password'] == password_entered) {
            request.query['uname'] = username_entered;
            response.redirect('/invoice.html?' + qs.stringify(request.query));
        }
        else {
            errors.push('Incorrect Password');
            request.query['uname'] = username_entered;
            request.query['name'] = user_data['uname'].name;
           // response.redirect('/login.html?' + qs.stringify(request.query));
        }
    } else {
        errors.push('Username not Found');
        request.query['uname'] = username_entered;
        //response.redirect('/login.html?' + qs.stringify(request.query));
    }

    if (errors.length > 0) { // If there are errors, send to the registration page again.
        //console.log(errors)
        request.query.errors = errors.join(', '); 
        response.redirect('login.html?' + qs.stringify(request.query));
      }  
});

// This processed the form from order_page.html
app.post('/process_register', function (request, response) { // set path location to test
    console.log(request.body);
    var errors = [];
    let username_entered = request.body['uname'];

    if(typeof user_data[username_entered] != 'undefined'){
        errors.push('Username Taken Already');
    }

    // Fixes so you can only register with letters and numbers for username
    if (/^[0-9a-zA-Z]+$/.test(request.body['uname'])) {
    }
    else {
        errors.push('Letters And Numbers Only for Username')
    }

    if (/^[a-zA-Z]+ [a-zA-Z]+$/.test(request.body['fullname'])) { //borrow code from https://www.codexworld.com/how-to/validate-first-last-name-with-regular-expression-using-javascript/
    }
    else { // Requires letters only
      errors.push('Enter full name correctly');
    }

    if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(request.body['email'])) {
    } // borrow regular expression from https://www.w3resource.com/javascript/form/email-validation.php
    else { // Requires letters only
      errors.push('Invalid Email');
    }

    // fixes the issue of allowing user to only create a password of only 3 characters long. meets specification of 6 characters minimum
    if (request.body['psw'].length < 6) {
        errors.push('Password Minimum 6 Characters')
    }

    if (request.body['psw'] !== request.body['psw-repeat']) { // makes sure password and repeat password are the same
        errors.push('Password Does Not Match');
    }


    if (errors.length == 0) { // If there are no errors, continues onto the invoice page
     //   POST = request.body;
        console.log('no errors');
        var username = request.body['uname']
        //username = request.body['uname'];
        user_data[username] = {};
        user_data[username]['password'] = request.body['psw'];
        user_data[username]['email'] = request.body['email'];
        user_data[username]['name'] = request.body['fullname'];
        fs.writeFileSync(user_data_file, JSON.stringify(user_data));
        //save updated user_data to file
        response.redirect('/login.html?' + qs.stringify(request.query));
    }
    if (errors.length > 0) { // If there are errors, send to the registration page again.
        //console.log(errors)
        request.query.errors = errors.join(', '); 
        response.redirect('registration.html?' + qs.stringify(request.query));
      }  
});

app.use(express.static('./public'));
app.listen(8080, () => console.log(`listening on port 8080`));

function isNonNegInt(q, return_errors = false) { // Checks to see if the inputted values are either positive, an integer, or a whole value
    var errors = []; // Assume there are no errors AT FIRST
    if (q == '') q = 0; // Sets blank inputs to the quantity of 0 
    if (Number(q) != q) errors.push('<font color="red">Not a number!</font>'); // Check if the string is a number value
    else if (q < 0) errors.push('<font color="red">Negative value!</font>'); // Check if the string is non-negative
    else if (parseInt(q) != q) errors.push('<font color="red">Not a full value!</font>'); 
    // Check that it is an integer
    return return_errors ? errors : (errors.length == 0);
}

