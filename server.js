const express = require('express');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const session = require('cookie-session');
const flash = require('connect-flash');

const app = express();

app.use(express.static('public'));

//app.use(expressEjsLayout);
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.urlencoded({extended:false}));

// validator
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
        , root = namespace.shift()
        , formParam = root;
      while(namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }
      return {
        param : formParam,
        msg   : msg,
        value : value
      };
    }
  }));

  // cookie-session
app.use(session({
  name : 'userid',
  keys: ['secretkey'],
  secret : 'secret',
  resave : true,
  saveUninitialized : true,
}));

// messages
app.use(flash());
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error  = req.flash('error');
  next();
});

//login page
app.get('/', (req,res)=>{
  res.redirect('login');
})

app.use('/',require('./routes/api'));

app.use('/',require('./routes/user'));

app.use(check_auth);

app.use('/',require('./routes/crud'));

app.use('/',require('./routes/leaflet'));

app.use('/',require('./routes/rate'));

app.get('/*', (req, res) => {
    res.set('Content-Type', 'text/plain');
    res.status(404).end("404 Not Found");
});

function check_auth(req,res,next){ // middleware
    console.log(req.path)
    if (!req.session.authenticated) {
        res.status(200).render("login");   
    }else{
        next()
    }
}

const server = app.listen(process.env.PORT || 8099, () => {
    const port = server.address().port;
    console.log(`Server is listening at port ${port}`);
});

