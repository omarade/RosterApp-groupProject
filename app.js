const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const pg = require('pg');
const Sequelize = require('sequelize');
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

const Time = db.define('time', {
	from: {type: Sequelize.DATE, allowNull: false},
	to: {type: Sequelize.DATE, allowNull: false}
})

User.belongsToMany(Time, {through: 'time_user'})
Time.belongsToMany(User, {through: 'time_user'})


Task.hasMany(Time)
Time.belongsTo(Task)



db.sync({force: true});

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



const listener = app.listen(3000, function () {
	console.log('Example app listening on port: ' + listener.address().port);
});