const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const pg = require('pg');
const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');

const db = new Sequelize(`postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@localhost/postgres`);

const session = require('express-session');


app.set('views', __dirname + '/src/views');
app.set('view engine', 'pug');

app.use('/', bodyParser()); //creates key-value pairs request.body in app.post, e.g. request.body.username
app.use(express.static('src/public'));

app.use(session({
	secret: process.env.secret,
	resave: true,
	saveUninitialized: false
}));


// Create model user
const User = db.define('user', {
	name: {type: Sequelize.STRING, allowNull: false},
	email: {type: Sequelize.STRING, allowNull: false, uniqe: true},
	password: {type: Sequelize.STRING, allowNull: false},
	isAdmin: {type: Sequelize.BOOLEAN, allowNull: false}
})

// Create model task
const Task = db.define('task', {
	name: {type: Sequelize.STRING, allowNull: false}
})

// Create model time
const Time = db.define('time', {
	date: {type:Sequelize.DATEONLY, allowNull: false},
	from: {type: Sequelize.TIME, allowNull: false},
	to: {type: Sequelize.TIME, allowNull: false}
})

// Define the relationships
User.belongsToMany(Time, {through: 'time_user'})
Time.belongsToMany(User, {through: 'time_user'})

Task.hasMany(Time)
Time.belongsTo(Task)

db.sync({force: true});


									/* roster */
app.get('/roster', (req,res) =>{

	let firstDay = "2017-6-12"
	let lastDay = "2017-6-18"

	User.findAll({
		include: [
			{ model: Time, 
				 where: {
		            date: {
		                $gte: firstDay 
		            },
		            date: {
		                $lte: lastDay
		            }
	        	},
			include: [{model: Task}]
		}]
	})
	.then((users) =>{
		console.log(users)
		res.render('roster', {users: users})
	})
})


								/* task */
app.get('/task', (req,res) =>{
	res.render('task')
})

app.post('/task', (req, res) =>{
	const taskName = req.body.task
	Task.create({
		name: taskName
	})
	.then((task) => {
		console.log(`Task id: ${task.id}`)
		res.redirect('/time?id=' + task.id)
	})
})

									/* time */
app.get("/time", (req, res) => {
	var task = req.query.id
	console.log("Task id from time get: " + task)

	res.render("time"/*, {task: task}*/)
})

app.post('/time', (req, res) => {
	var date = req.body.date
	var from = req.body.from
	var to = req.body.to
	var taskId = req.query.id
	var next = req.body.next // 0 false 1 true
	console.log(req.body)
	console.log('taskId '+ taskId)
	console.log('reached')
	Time.create({
		date: date,
		from: from,
		to: to,
		taskId: taskId
	})
	.then( ()=>{
		console.log("next: " + next)
		if(next === "0" ) {
			console.log("redirect task")
			res.redirect("/task")
		}
		else if (next === "1") {
			console.log("redirect time")
			res.redirect("/time?id=" + taskId)		
		}
	})

})



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

			console.log(user)
		 
			 	var hash =  user.password

				  bcrypt.compare(password, hash, function(err, result) {

					 		if(result === true){

					 			// req.session.user = user;

					 			response.render('addWorker'); 
					 		}

					});
				
		});
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
		response.render ('logIn') 
		})
	})
});



								/* the server */
const listener = app.listen(3000, function () {
	console.log('Example app listening on port: ' + listener.address().port);
});