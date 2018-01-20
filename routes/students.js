var express = require('express');
var app = express();

// SHOW LIST OF students
app.get('/', function (req, res, next) {
	req.getConnection(function (error, conn) {
		conn.query('SELECT * FROM students ORDER BY id DESC', function (err, rows, fields) {
			//if(err) throw err
			if (err) {
				req.flash('error', err)
				res.render('student/list', {
					title: 'student List',
					data: ''
				})
			} else {
				// render to views/student/list.ejs template file
				res.render('student/list', {
					title: 'student List',
					data: rows
				})
			}
		})
	})
})

// SHOW ADD student FORM
app.get('/add', function (req, res, next) {

	req.getConnection(function (error, conn) {
		conn.query('SELECT * FROM events ', function (err, rows, fields) {
			// render to views/student/add.ejs
			res.render('student/add', {
				title: 'Add New student',
				name: '',
				year: '',
				course: '',
				rollno: '',
				gender: '',
				branch: '',
				events: rows
			});
		});
	});
});

// ADD NEW student POST ACTION
app.post('/add', function (req, res, next) {
	req.assert('name', 'Name is required').notEmpty() //Validate name
	req.assert('year', 'year is required').notEmpty() //Validate year
	req.assert('course', 'A valid course is required').notEmpty() //Validate course
	req.assert('rollno', 'rollno is required').notEmpty()
	req.assert('gender', 'gender is required').notEmpty()
	req.assert('branch', 'branch is required').notEmpty()
	var errors = req.validationErrors()

	if (!errors) { //No errors were found.  Passed Validation!

		/********************************************
		 * Express-validator module
		 
		req.body.comment = 'a <span>comment</span>';
		req.body.username = '   a student    ';

		req.sanitize('comment').escape(); // returns 'a &lt;span&gt;comment&lt;/span&gt;'
		req.sanitize('username').trim(); // returns 'a student'
		********************************************/
		var student = {
			name: req.sanitize('name').escape().trim(),
			year: req.sanitize('year').escape().trim(),
			course: req.sanitize('course').escape().trim(),
			rollno: req.sanitize('rollno').escape().trim(),
			gender: req.sanitize('gender').escape().trim(),
			branch: req.sanitize('branch').escape().trim()
		}
		var event = [];
		req.getConnection(function (error, conn) {


			conn.query('INSERT INTO students SET ?', student, function (err, result) {
				//if(err) throw err
				if (err) {
					req.flash('error', err)

					// render to views/student/add.ejs
					res.render('student/add', {
						title: 'Add New student',
						name: student.name,
						year: student.year,
						course: student.course,
						rollno: student.rollno,
						gender: student.gender,
						branch: student.branch
					})
				} else {
					for (let i = 0; i < req.body.event.length; i++) {
						let currEvent = [];
						currEvent.push(req.body.event[i]);
						conn.query('SELECT id from events where event_name = ?', currEvent, function (err, rows, fields) {
							let entry = {
								rollno: parseInt(student.rollno),
								event_id: rows[0].id
							};
							conn.query('INSERT INTO event_student SET ?', entry, function (err, result) {
							});		
						});
					}

					
					
					req.flash('success', 'Data added successfully!')

					// render to views/student/add.ejs
					res.redirect('/students');
				}
			})
		})
	} else { //Display errors to student
		var error_msg = ''
		errors.forEach(function (error) {
			error_msg += error.msg + '<br>'
		})
		req.flash('error', error_msg)

		/**
		 * Using req.body.name 
		 * because req.param('name') is deprecated
		 */
		res.render('student/add', {
			title: 'Add New student',
			name: req.body.name,
			year: req.body.year,
			course: req.body.course,
			rollno: req.body.rollno,
			gender: req.body.gender,
			branch: req.body.branch,
			event: ''
		})
	}
})

// SHOW EDIT student FORM
app.get('/edit/(:id)', function (req, res, next) {
	req.getConnection(function (error, conn) {
		conn.query('SELECT * FROM students WHERE id = ' + req.params.id, function (err, rows, fields) {
			if (err) throw err

			// if student not found
			if (rows.length <= 0) {
				req.flash('error', 'student not found with id = ' + req.params.id)
				res.redirect('/students')
			} else { // if student found
				// render to views/student/edit.ejs template file
				res.render('student/edit', {
					title: 'Edit student',
					//data: rows[0],
					id: rows[0].id,
					name: rows[0].name,
					year: rows[0].year,
					course: rows[0].course,
					rollno: rows[0].rollno,
					gender: rows[0].gender,
					branch: rows[0].branch
				})
			}
		})
	})
})

// EDIT student POST ACTION
app.put('/edit/(:id)', function (req, res, next) {
	req.assert('name', 'Name is required').notEmpty() //Validate name
	req.assert('year', 'year is required').notEmpty() //Validate year
	req.assert('course', 'A valid course is required').notEmpty()
	req.assert('rollno', 'rollno is required').notEmpty()
	req.assert('gender', 'gender is required').notEmpty()
	req.assert('branch', 'branch is required').notEmpty() //Validate course

	var errors = req.validationErrors()

	if (!errors) { //No errors were found.  Passed Validation!

		/********************************************
		 * Express-validator module
		 
		req.body.comment = 'a <span>comment</span>';
		req.body.username = '   a student    ';

		req.sanitize('comment').escape(); // returns 'a &lt;span&gt;comment&lt;/span&gt;'
		req.sanitize('username').trim(); // returns 'a student'
		********************************************/
		var student = {
			name: req.sanitize('name').escape().trim(),
			year: req.sanitize('year').escape().trim(),
			course: req.sanitize('course').escape().trim(),
			rollno: req.sanitize('rollno').escape().trim(),
			gender: req.sanitize('gender').escape().trim(),
			branch: req.sanitize('branch').escape().trim()
		}

		req.getConnection(function (error, conn) {
			conn.query('UPDATE students SET ? WHERE id = ' + req.params.id, student, function (err, result) {
				//if(err) throw err
				if (err) {
					req.flash('error', err)

					// render to views/student/add.ejs
					res.render('student/edit', {
						title: 'Edit student',
						id: req.params.id,
						name: req.body.name,
						year: req.body.year,
						course: req.body.course,
						rollno: req.body.rollno,
						gender: req.body.gender,
						branch: req.body.branch
					})
				} else {
					req.flash('success', 'Data updated successfully!')

					// render to views/student/add.ejs
					res.render('student/edit', {
						title: 'Edit student',
						id: req.params.id,
						name: req.body.name,
						year: req.body.year,
						course: req.body.course,
						rollno: req.body.rollno,
						gender: req.body.gender,
						branch: req.body.branch
					})
				}
			})
		})
	} else { //Display errors to student
		var error_msg = ''
		errors.forEach(function (error) {
			error_msg += error.msg + '<br>'
		})
		req.flash('error', error_msg)

		/**
		 * Using req.body.name 
		 * because req.param('name') is deprecated
		 */
		res.render('student/edit', {
			title: 'Edit student',
			id: req.params.id,
			name: req.body.name,
			year: req.body.year,
			course: req.body.course,
			rollno: req.body.rollno,
			gender: req.body.gender,
			branch: req.body.branch
		})
	}
})

// DELETE student
app.delete('/delete/(:id)', function (req, res, next) {
	var student = {
		id: req.params.id
	}

	req.getConnection(function (error, conn) {
		conn.query('DELETE FROM students WHERE id = ' + req.params.id, student, function (err, result) {
			//if(err) throw err
			if (err) {
				req.flash('error', err)
				// redirect to students list page
				res.redirect('/students')
			} else {
				req.flash('success', 'student deleted successfully! id = ' + req.params.id)
				// redirect to students list page
				res.redirect('/students')
			}
		})
	})
})

module.exports = app