							/* requiring node libraries */
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
	secret: process.env.SESSION_SECRET,
	resave: true,
	saveUninitialized: false
}));

// Create model user
const User = db.define('user', {
	name: {type: Sequelize.STRING, allowNull: false},
	email: {type: Sequelize.STRING, allowNull: false, uniqe: true},
	password: {type: Sequelize.STRING, allowNull: false},
	isAdmin: {type: Sequelize.BOOLEAN, allowNull: false}
});

// Create model task
const Task = db.define('task', {
	name: {type: Sequelize.STRING, allowNull: false}
});


// Create model time
const Time = db.define('time', {
	date: {type:Sequelize.DATEONLY, allowNull: false},
	from: {type: Sequelize.TIME, allowNull: false},
	to: {type: Sequelize.TIME, allowNull: false}
});

// Define the relationships
User.belongsToMany(Time, {through: 'time_user'});
Time.belongsToMany(User, {through: 'time_user'});

Task.hasMany(Time);
Time.belongsTo(Task);

db.sync({force: true})
.then(()=>{
	bcrypt.hash('12345o', 10, function(err, hash) {
		User.create({
			name: 'Omar AD',
			email: 'omar@gmail.com',
			password: hash,
			isAdmin: true
		})
	})
})

									/* roster */
// A function that gets all the date between 
// two dates
var getDates = function(startDate, endDate) {
	var dates = [],
   	currentDate = startDate,
    	addDays = function(days) {
	    	var date = new Date(this.valueOf());
	    	date.setDate(date.getDate() + days);
    	return date;
    };
	while (currentDate <= endDate) {
	  	dates.push(currentDate);
	  	currentDate = addDays.call(currentDate, 1);
	}
	return dates;
};

// renders the page roster
app.get('/roster', (req,res) =>{
	var user = req.session.user;
	if(user === undefined){
		res.render('logIn',{message: "Please log in to view your profile"});
	}
	else{
		let today = new Date(); // the first date
		today = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
		let lastDay = new Date(); // the last date
		lastDay = lastDay.getFullYear()+'-'+(lastDay.getMonth()+1)+'-'+(lastDay.getDate()+2);

		User.findAll({
			include: [
				{ model: Time, 
					where: {
			            date: {
			                $gte: today,
			                $lte: lastDay
			            },
		        	}, 
		        	order: '"date" ASC',
				include: [{model: Task}]
			}]
		})
		.then((users) =>{
			var dates = getDates(new Date(today), new Date(lastDay));                                                                                                           
				dates.forEach(function(date) {
				 console.log('!!!'+date);
			});
			res.render('roster', {users: users, days: dates});
		})
		.catch((err) =>{
			throw err;
		});
	}
});
// Gets the information from the client and deals with it
app.post('/roster', (req,res) =>{
	let firstDay = req.body.firstDay
	let lastDay = req.body.lastDay
	User.findAll({
		include: [
			{ model: Time, 
				where: {
		            date: {
		                $gte: firstDay,
		                $lte: lastDay
		            }
	        	}, 
	        	order: '"date" ASC',
			include: [{model: Task}]
		}]
	})
	.then((users) =>{
		var dates = getDates(new Date(firstDay), new Date(lastDay));                                                                                                           
			dates.forEach(function(date) {
			 console.log(date);
		});
		res.render('roster', {users: users, days: dates});
	})
	.catch((err) =>{
		throw err;
	});
});

							/* Validation */

app.post('/validation', function(req,res){ // deal with an ajax request and send a response
	User.findOne({ //look if a user already has an account
		where: {
			email: req.body.typedIn
		}
	})
	.then((user) =>{
		var message = '';
		if(user){ // if so send this message
			message = 'This email already exists';
			res.send(message);
		}
		else{ // otherwise do this
			message = '';
			res.send(message);
		}
	})
	.catch((err) =>{
		throw err;
	});	
});


								/* TASK, Check if user loged in and is an Admin before rendering */
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

								/*Add a task to the database*/
app.post('/task', (req, res) =>{
	const taskName = req.body.task
	Task.create({
		name: taskName
	})
	.then((task) => {
		res.redirect('/time?id=' + task.id)
	})
	.catch((err) =>{
		throw err;
	});
});

								/* TIME, Check if user loged in and is an Admin before rendering */
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

								/*link time and users to a task and add to database*/
app.post('/time', (req, res) => {
	const formData = JSON.parse(decodeURIComponent(req.body.formData))
	var date = formData.date
	var from = formData.from
	var to = formData.to
	var taskId = req.body.taskId	
	
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
			res.send({url0: "/task", url1: "/time?id=" + taskId})
		})
	})
	.catch((err) =>{
		throw err;
	});
});


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
		if(user){
		 	var hash =  user.password
			bcrypt.compare(password, hash, function(err, result) {
				if(result === true){
					request.session.user = user
				 	response.redirect('/roster')
				}
				else{
					response.render('logIn', {message:'Invalid email or password'});
				}
			});
		}
		else{
			response.render('logIn', {message: "You don't have an account!!"});
		}
	})
	.catch((err) =>{
		throw err;
	});
});


// add worker route
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
	let email = request.body.typedIn
	let password = request.body.password
	let type = request.body.type
	User.findOne({
		where: {
			email: email
		}
	})
	.then((user)=>{
		if(user){

		}
		else{
			bcrypt.hash(password, 10, function(err, hash) {
				User.create({
					name: name ,
					email: email,
					password: hash,
					isAdmin: type
				})
				.then( () => {
					response.render('addWorker', {message: "User has been added"})
				})
				.catch((err) =>{
					throw err;
				});
			})
		}
	})
});

								/* Logout */
app.get('/logout', (req,res) =>{
	req.session.destroy((err) =>{ // destroy the session
		if(err){
			throw err
		}
		res.render('logIn',{message: 'Successfully logged out.'}) // message isn't working
	})
})

								/* the server */
const listener = app.listen(3000, function () {
	console.log('Example app listening on port: ' + listener.address().port);
})