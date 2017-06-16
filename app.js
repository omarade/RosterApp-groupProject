const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const pg = require('pg');
const Sequelize = require('sequelize');
const db = new Sequelize(`postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@localhost/postgres`); 
const session = require('express-session');

app.use('/', bodyParser()); //creates key-value pairs request.body in app.post, e.g. request.body.username
app.use(express.static('src/public'));
app.use(session({
	secret: process.env.secret,
	resave: true,
	saveUninitialized: false
}));

// Create model user
var User = db.define('user', {
	name: {type: Sequelize.STRING, allowNull: false},
	email: {type: Sequelize.STRING, allowNull: false, uniqe: true},
	password: {type: Sequelize.STRING, allowNull: false}
})

// Create model roster
var Roster = db.define('roster', {
	name: {type: Sequelize.STRING, allowNull: false},
	mon: {type: Sequelize.STRING, allowNull: false},
	tues: {type: Sequelize.STRING, allowNull: false},
	wed: {type: Sequelize.STRING, allowNull: false},
	thurs: {type: Sequelize.STRING, allowNull: false},
	fri: {type: Sequelize.STRING, allowNull: false}
})

User.hasOne(Roster)
Roster.belongsTo(User)



db.sync({force: true});


// login route

app.get('/login', function(request, response) {



  response.render ("logIn")
});

app.post('/login', function(request, response) {




  response.render ("logIn")
});


app.get('/addWorker', function(request, response) {

  response.render ("addWorker")
});

// add worker routs




const listener = app.listen(3000, function () {
	console.log('Example app listening on port: ' + listener.address().port);
});