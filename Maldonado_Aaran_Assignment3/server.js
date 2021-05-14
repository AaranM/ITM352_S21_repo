// Aaran Maldonado's assignment 3 server
// server structure from getting started assignment2 screencast and lab13-14
var express = require('express');
var app = express();
var myParser = require("body-parser");
app.use(myParser.urlencoded({ extended: true }));
var qs = require('qs');
var fs = require('fs');
var data = require('./public/products_data.js'); // Pulls the data from products.js and sets it in a variable called data
var allProducts = data.allProducts; //set variable 'allProducts' to the products_data.js file
var user_data_file = './user_data.json'
var cookieParser = require('cookie-parser'); // loads cookie parser; allows cookies to be created & deleted
var session = require('express-session'); // loads sessions;
var nodemailer = require('nodemailer'); // loads the mail module

app.use(cookieParser());
app.use(session({ //
    secret: 'ITMRocks!', //random string to encrypt session ID
    resave: true, //save session
    saveUninitialized: false, //forget session after user is done
    httpOnly: false, //allows browser js from accessing cookies
    secure: true, //ensures cookies are only used over HTTPS
    ephemeral: true // deletes cookie when browser is closed
  }));

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
    if(typeof request.session.cart == 'undefined') { request.session.cart = {}; } //from assignment3 code example
    next(); // Go onto next route
});

app.post("/process_order", function (request, response) {
let user_quantity_data = request.body;
const stringified = qs.stringify(user_quantity_data);
// If statement created to determine whether or not values are positive.
if (typeof user_quantity_data['addProducts${i}'] != 'undefined') {
    has_errors = false; //assume quantities are valid from the start
        total_qty = 0; //need to check if something was selected so we will look if the total > 0
    for (i = 0; i < `${(products_array[`type`][i])}`.length; i++) {
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
        response.redirect('./index.html?' + qs.stringify(user_quantity_data));
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
            response.cookie('uname', `${request.body.uname}`, { maxAge: 180000 })
            response.cookie('email', `${user_data[request.body.uname].email}`, { maxAge: 180000 })
            response.cookie('name', `${user_data[request.body.uname].name}`, {maxAge: 180000}) //create cookie for name
            session.uname = username_entered;
            var theDate = Date.now(); //sets the time of login
            session.last_login_time = theDate; //remember this login time in session
            response.redirect('/index.html?' + qs.stringify(request.query));
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
    else {
        session.uname = username_entered;
        var theDate = Date.now(); //sets the time of login
        session.last_login_time = theDate; //remember this login time in session
        response.cookie('uname', username_entered, {maxAge: 180000}); //create cookie for username
        response.cookie('name', user_data['uname'].name, {maxAge: 180000}) //create cookie for name
        response.cookie('email', user_data.email, {maxAge: 180000}) //create cookie for email
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

app.post("/generateInvoice", function (request, response) { // borrow some code from alyssa mencel
    cart = JSON.parse(request.query['cartData']); //cart = parsed cartData
    cookie = JSON.parse(request.query['cookieData']); // cookie = parsed cookieData
    var theCookie = cookie.split(';'); //divide cookie
    for (i in theCookie) {
      //function taken from stackoverflow.com
      function split(theCookie) { //split the cookie before the =
        var i = theCookie.indexOf("="); //everything before the =
  
        if (i > 0)
          return theCookie.slice(0, i);//cut off the rest of the string after =
        else {
          return "";
        }
      };
  
      var key = split(theCookie[i]); //key = string before =
  
      if (key == ' uname') { //set to theUsername 
        var theUsername = theCookie[i].split('=').pop(); //sets variable for username in cookie
      };
  
      if (key == 'email') { //set email
        var email = theCookie[i].split('=').pop(); //sets variable 'email'
      };

      if (key == ' name') { //set to FullName 
        var FullName = theCookie[i].split('=').pop(); //sets variable for username in cookie
      };

    }
    console.log(theUsername);
//create a string with the invoice then email it to user and send back to cart for displaying on the browser (the below code is copied from invoice.html)

str = `<style>
/* Borrowed Code from WesCossick */
.invoice {
max-width: 800px;
margin: auto;
padding: 30px;
border: 1px solid #eee;
box-shadow: 0 0 10px rgba(0, 0, 0, .15);
font-size: 16px;
line-height: 24px;
font-family: "Montserrat", sans-serif;
color: #555;
background-color: white;
}

/*Borrowed Code from WesCossick */
.invoice table {
width: 100%;
line-height: inherit;
text-align: left;
background-color: white;
}

/*Borrowed Code from WesCossick*/
.invoice table td {
padding: 5px;
vertical-align: top;
background-color: white;
}

/*Borrowed Code from WesCossick */
.invoice table tr td:nth-child(2) {
text-align: right;
background-color: white;
}

body {
background-color:goldenrod;
}
</style>
<body>
<h3 align="center">Thank you, ${FullName}!</font><br />An email has been sent to <font color="black">${email}</font></h3>
<div class="invoice">
    <table border="2">
        <tbody>
            <tr>
                <br>
                <th style="text-align: center;" width="15%">Item</th>
                <th style="text-align: center;" width="20%">quantity</th>
                <th style="text-align: center;" width="67%">price</th>
                <th style="text-align: center;" width="35%">extended price</th>
            </tr>
        `;
subtotal = 0; //subtotal starts off as 0
for (products in allProducts) {
  for (i = 0; i < allProducts[products].length; i++) {

    qty = cart[`${products}${i}`];
    if (qty > 0) { //if there is a quantity entered in the textbox
      extended_price = qty * allProducts[products][i].price //extended price equation
      subtotal += extended_price; //adding extended price for each product to the subtotal

      str += `
                <tr>
                <td align="center" width="35%">${allProducts[products][i].name}</td>
                <td align="center" width="20%">${qty}</td>
                <td align="center" width="13%">\$${allProducts[products][i].price.toFixed(2)}</td>
                <td align="center" width="67%">\$${extended_price.toFixed(2)}</td>
                </tr>
            `;

    }

  }

}

//Compute sales tax
var tax_rate = 0.0575;
var sales_tax = tax_rate * subtotal;

//Compute shipping
if(subtotal<50){
    shipping = 2;
}
else if(subtotal<100){
    shipping = 5;
}
else{
    shipping = .05*subtotal; //5% of subtotal
}

//Compute grand total
var grand_total = sales_tax + subtotal + shipping;

str += `
        <tr>
                <td colspan="5" width="100%">&nbsp;</td>
            </tr>
            <tr>
                <td style="text-align: center;" colspan="3" width="67%">Sub-total</td>
                <td width="54%">$${subtotal.toFixed(2)}</td>
            </tr>
            <tr>
                <td style="text-align: center;" colspan="3" width="67%"><span style="font-family: arial;">Tax @
                        5.75%</span></td>
                <td width="54%">$${sales_tax.toFixed(2)}</td>
            </tr>
            <tr>
                <td style="text-align: center;" colspan="3" width="67%"><span style="font-family: arial;">Shipping</span></td>
                <td width="54%">$${shipping.toFixed(2)}</td>
            </tr>
            <tr>
                <td style="text-align: center;" colspan="3" width="67%"><strong>Total</strong></td>
                <td width="54%"><strong>$${grand_total.toFixed(2)}</strong></td>
            </tr>
        </tbody>
    </table>
    `;

//this code was from nodemailer.com
var transporter = nodemailer.createTransport({ //variable for transporter
  host: 'mail.hawaii.edu', 
  port: 25,
  secure: false,
  tls: {
    rejectUnauthorized: false
  }
});
var mailOptions = {
  from: 'jon.doe.01134@gmail.com', // my burner email
  to: email, //fetch email from the cookie from cart.html 
  subject: 'Invoice',
  html: str //the above string will return as html in the body of the email
};

transporter.sendMail(mailOptions, function (error, info) {
  if (error) { 
    str += '<br>There was an error and your invoice could not be emailed'
    console.log(error);
} else { 
    console.log('Email sent: ' + info.response);
}
});

// string goes to be displayed in browser
request.session.destroy();
response.send(str);
});

app.get("/logout", function (request, response) {
  response.clearCookie('uname');
  response.clearCookie('email');
  response.clearCookie('name');
  request.session.destroy();
  response.redirect('/');
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

