const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const pg = require('pg');
const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');
// const db = new Sequelize(`postgres://SHMUEL:5432@localhost/workrooster`);

const session = require('express-session');


app.set('views', __dirname + '/src/views');
app.set('view engine', 'pug');

app.use('/', bodyParser()); //creates key-value pairs request.body in app.post, e.g. request.body.username
app.use(express.static('src/public'));

// app.use(session({
// 	secret: process.env.secret,
// 	resave: true,
// 	saveUninitialized: false
// }));

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


const Time = db.define('time', {
	from: {type: Sequelize.DATE, allowNull: false},
	to: {type: Sequelize.DATE, allowNull: false}
})

User.belongsToMany(Time, {through: 'time_user'})
Time.belongsToMany(User, {through: 'time_user'})


Task.hasMany(Time)
Time.belongsTo(Task)



db.sync({force: false});

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
		res.redirect(`/time/${task.id}`)
	})
})

app.get("/time/:id", (req, res) => {
	var task = req.params.id
	console.log("Task id from time get: " + task)

	res.render("time", {task: task})
})

app.post('/time/:id', (req, res) => {
	var from = req.body.from
	var to = req.body.to
	var taskId = req.params.id
	console.log('taskId '+ taskId)
	console.log('reached')
	Time.create({
		from: from,
		to: to,
		taskId: taskId
	})
	.then( ()=>{
		res.send('Done')
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
			console.log(user.isAdmin)
			var userType = user.isAdmin;
			 	var hash =  user.password
				  bcrypt.compare(password, hash, function(err, result) {
					 		if(result === true && userType === true){
					 			// request.session.user = user;

					 			// if(user.isAdmin === true){

					 			response.render('adminroster'); }
					 			else{ 

					 			if(result === true && userType === false)

								response.render('login');

					 			}

					 			// response.render('/'); // home pages

			
					 			
					});
		});
});



// admin home route
app.get('/adminhome', function(request, response) {

  response.render ("adminhome")
});


app.get('/adminroster', function(request, response) {

  response.render ("adminroster")
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



const listener = app.listen(3000, function () {
	console.log('Example app listening on port: ' + listener.address().port);
});