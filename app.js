// intial the require module
const  express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
require('dotenv').config();
const passport = require('passport')

// set db connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB Atlas');
})
.catch((err) => {
  console.error(err);
});

// inital app
const app = express();

// bring the model
let Article = require('./models/article')

// inital the template
app.set('views',path.join(__dirname,'views'));
app.set('view engine', 'pug');

// parse
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// set public folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session Middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
  }));
  
  // Express Messages Middleware
  app.use(require('connect-flash')());
  app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
  });
  
  // Express Validator Middleware
  app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
      var namespace = param.split('.')
        , root = namespace.shift()
        , formParam = root;
  
      while (namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }
      return {
        param: formParam,
        msg: msg,
        value: value
      };
    }
  }));

// passport config
require('./config/passport')(passport);
// passport middleware
app.use(passport.initialize())
app.use(passport.session())

// 
app.get('*', function(req,res,next){
  res.locals.user = req.user|| null
  next()
})


  
// create route
app.get('/',function(req,res){
    Article.find({}, function(err, articles){
        if(err){
            console.log(err);
        }else{
            res.render('index',{
                title:'Articles',
                articles : articles
            });
        }
    });    
});

// bring the route file
let articles = require('./routes/articles');
app.use('/articles',articles)

// bring the route file
let users = require('./routes/users');
app.use('/users',users)


// run the server
app.listen( process.env.PORT || 80, () => console.log('app is running '));