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

User.belongsToMany(Time, {through: 'time_user'})
Time.belongsToMany(User, {through: 'time_user'})

Task.hasMany(Time)
Time.belongsTo(Task)

db.sync({force: false});

app.get('/task', (req,res) =>{
	const user = req.session.user;
	if (user === undefined) {
		res.render('logIn', {message: "Please log in"})
	}
	else if(user && (user.isAdmin === false)){
		res.redirect('/roster')
	}
	else{
		res.render('task')
	}	
})

app.post('/task', (req, res) =>{
	const taskName = req.body.task
	Task.create({
		name: taskName
	})
	.then((task) => {
		res.redirect('/time?id=' + task.id)
	})
})

app.get("/time", (req, res) => {
	const user = req.session.user;
	if (user === undefined) {
		res.render('logIn', {message: "Please log in"})
	}
	else if(user && (user.isAdmin === false)){
		res.redirect('/roster')
	}
	else{
		let task = req.query.id
		User.findAll()
		.then((users)=> {
			res.render("time", {task: task, users: users})			
		})
	}	
})

app.post('/time', (req, res) => {
	const formData = JSON.parse(decodeURIComponent(req.body.formData))
	var date = formData.date
	var from = formData.from
	var to = formData.to
	var taskId = req.body.taskId	
	var btnVal = req.body.btnVal
	
	Time.create({
		date: date,
		from: from,
		to: to,
		taskId: taskId
	})
	.then( (time)=>{
		User.findAll({
			where: {
				id: formData.user
			}
		})
		.then(user => {
			time.setUsers(user) //checkUsers
			console.log("btnVal: " + btnVal)
			res.send({url0: "/task", url1: "/time?id=" + taskId})
			
			/*if(btnVal === '0') {
				console.log("redirect task")
				res.redirect("/task")
			}
			else if (btnVal === '1') {
				console.log("redirect time")
				res.redirect("/time?id=" + taskId)		
			}*/	
		})			
	})
})

// login route
app.get('/login', function(request, response) {

  response.render ("logIn")
});

app.post('/login', function(request, response) {
	let email = request.body.email
	let password = request.body.password

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
	 			request.session.user = user;
	 			response.redirect('/roster'); 
	 		}
		});				
	});
});


// add worker routs
app.get('/addWorker', function(request, response) {
	const user = request.session.user;
	if (user === undefined) {
		response.render('logIn', {message: "Please log in"})
	}
	else if(user && (user.isAdmin === false)){
		response.redirect('/roster')
	}
	else{
		response.render ("addWorker")	
	} 
});


app.post('/addWorker', function(request, response) {
	let name = request.body.names
	let email = request.body.email
	let password = request.body.password
	let type = request.body.type

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

												/* The server */
const listener = app.listen(3000, function () {
	console.log('Example app listening on port: ' + listener.address().port);
});