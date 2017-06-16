const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const pg = require('pg');
const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');
// const db = new Sequelize(`postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@localhost/postgres`);
const db = new Sequelize('postgres://SHMUEL:5432 @localhost/bulletinboard');

const session = require('express-session');


app.set('views', 'src/views');
app.set('view engine', 'pug');
app.use('/', bodyParser()); //creates key-value pairs request.body in app.post, e.g. request.body.username
app.use(express.static('src/public'));

// app.use(session({
// 	secret: process.env.secret,
// 	resave: true,
// 	saveUninitialized: false
// }));

// Create model user
var User = db.define('user', {
	name: {type: Sequelize.STRING, allowNull: false},
	email: {type: Sequelize.STRING, allowNull: false, uniqe: true},
	password: {type: Sequelize.STRING, allowNull: false},
	isAdmin: {type: Sequelize.BOOLEAN, allowNull: false}
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

	let email = request.body.email
	let password = request.body.password

	console.log(email);
	console.log(password);


		User.findOne({
			where: {
				email: email
				}
			})
	
		.then( (user) => {
		 
			 	var hash =  user.password

				  bcrypt.compare(password, hash, function(err, result) {

					 		if(result === true){

					 			// req.session.user = user;

					 			response.render('addWorker'); 
					 		}

					});
				
		});




  response.render ("logIn")
});


// add worker routs
app.get('/addWorker', function(request, response) {

  response.render ("addWorker")
});


app.post('/addWorker', function(request, response) {

	let name = request.body.names
	let email = request.body.email
	let password = request.body.password
	let type = request.body.type
	console.log(name);
	console.log(email);
	console.log(password);
	console.log(type);

	bcrypt.hash(password, 10, function(err, hash) {

		User.create({
		name: name ,
		email: email,
		password: hash,
		isAdmin: type
		})
	.then( () => {
		response.render ('addWorker') 
		})
	})
});






const listener = app.listen(3000, function () {
	console.log('Example app listening on port: ' + listener.address().port);
});