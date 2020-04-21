const express = require('express');
const router = express.Router();
const path = require('path');
const jwt = require('jsonwebtoken');

/* GET home page. */
/// Ultimately, any request to the root index, must be made with
/// a valid token, without a valid token, redirect to /login page occurs 

router.get('/', verify, function(req, res, next) {

	if(req.loggedIn === true) {
		res.sendFile(path.join(__dirname, '../public/html/index.html'));
	}
	else {
		res.status(403).redirect('/login'); 
	}
}); 

router.route('/login')

	.get(function (req, res, next) { 
		res.sendFile(path.join(__dirname, '../public/html/login.html'));
	})

	.post(function (req, res, next) {

		// Compare login information from front-end form to those in database; use variables for now
		const username = 'sampleusername';
		const password = '1234';

		if ( (req.body.username === username) && (req.body.password === password)  ) {

			try {

				jwt.sign(
					{username: username}, 
					'shhh',  
					{expiresIn: '60 seconds'}, 
					function(error, token) {
						res.cookie('token', token, {maxAge: 60000, httpOnly: true, sameSite: true});
						res.redirect('/');
					}
				);

			}
			catch (error) {
				res.json({error: error});
			}

		}
		else {
			res.redirect(303, '/redirect');
		}
	})

router.get('/redirect', function (req, res, next) {
	res.set('Location', 'http://localhost:3000/login');
	res.sendFile(path.join(__dirname, '../public/html/redirect.html'));
});

// Middleware //

/// Verify token if present
function verify (req, res, next) {

	console.log(req.cookies.token ? req.cookies.token : 'No token present');

	try {
		jwt.verify(req.cookies.token, 'shhh', function (error, decoded) {
			req.loggedIn = true; 
			console.log('Logged in : ' + decoded.username);
		}); 
	}
	catch (error) {
		req.loggedIn = false;
	}

	next();
}

module.exports = router;
