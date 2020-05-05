var express = require('express');
var app = express();

var mongoose = require('mongoose');
var bodyParser = require('body-parser');

var handlebars = require('express-handlebars');
var bcrypt = require('bcryptjs');
var passport = require('passport');
var session = require('express-session');


const port = process.env.PORT || 3000;
const mongoURL = process.env.mongoURL || 'mongodb://localhost:27017/handlebars';

//requires a specific function 
var { isAuth } = require('./middleware/isAuth');
require('./middleware/passport')(passport);

// requires files defining content schema
var Contact = require('./models/Contact');
var User = require('./models/User');

//linking to public folder
app.use(express.static('public'));

app.use(
    session({
        secret: 'mySecret',
        resave: true,
        saveUninitialized: true,
        //addind a logged in timelimit
        cookie: { maxAge: 60000 }
    })
);

app.use(passport.initialize());
app.use(passport.session());


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.set('view engine', 'hbs');

app.engine('hbs', handlebars({
    layoutsDir: __dirname + '/views/layouts',
    extname: 'hbs'
}))


//this sets inital landing page is defult page -> '/' is the default location
app.get('/', (req, res) =>{
    res.render('login', {layout: 'main' });
})

//web application getting something from the server
//req = request //res = response //=>'fat arrow' = function
//isAuth prevents somesone seeing a dashboard without authentication
//can reuse isAuth for all pages that require a login
app.get('/dashboard', isAuth, (req, res) => {
    //here the code is just finding entries related to the logged in user
    //they both share the same id 
    Contact.find({ user: req.user.id }).lean()
    .exec((err, contacts) =>{
        if(contacts.length){
            res.render('dashboard', { layout: 'main', contacts: contacts, contactsExist: true, username: req.user.username });
        } else{
            res.render('dashboard', { layout: 'main', contacts: contacts, contactsExist: false, username: req.user.username });
        }  
    });
});

//async function used here (for security)
//prevents a user making 2 accounts with the same email
// sending username and password to database
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    try {
        //checks if email already exisits
        let user = await User.findOne({ username });

        if(user) {
            //if it does, gives feedback and doesnt send to database
            //400 = bad request - user aleardy exists
            return res.status(400).render('login', {layout: 'main', userExist: true});
        }
        user = new User({
            username,
            password
        });
        //salt is a type of encryption that adds characters to the end of a password
        const salt = await bcrypt.genSalt(10);
        //encrypting the password
        user.password = await bcrypt.hash(password, salt);
    
        await user.save();
        // prevent hanging, redirect back to home page
        res.status(200).render('login', {layout: 'main', userDoesNotExist: true});
    } catch(err){
        //if theres an error, stop the code and feedback to client
        console.log(err.message);
        res.status(500).send('Server Error')
    }
})


app.post('/signin', (req, res, next) => {
    try{
        passport.authenticate('local', {
            //if successful- user taken to dashboard
            successRedirect: '/dashboard',
            //if failure query incorrectLogin
            failureRedirect: '/?incorrectLogin'
        })(req, res, next)
    } catch(err){
        console.log(err.message);
        res.status(500).send('Server Error')
    }
})

app.get('/signout', (req, res) =>{
    req.logout();
    res.redirect('/');
})


// adding a contact
app.post('/addContact', (req, res) =>{
    const { name, email, number} = req.body;
    var contact = new Contact({
        user: req.user.id,
        name,
        email,
        number
    });

    contact.save();
    // prevent hanging, redirect back to home page
    res.redirect('/dashboard?contactSaved');
})


mongoose.connect(mongoURL, {
    useUnifiedTopology: true,
    useNewUrlParser: true
})
.then(() => {
    console.log('Connected to the DB :)');
})
.catch((err) => {
    console.log('Not connected to the DB with err: ' + err);
});


//listening for requests on port 3000
app.listen(port,() => {
    console.log(`Server listening on port ${port}`);
});