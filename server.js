require('dotenv').config();

// Carrega o Express
const express = require('express');
const app = express();

// Conecxão a banco de dados
const mongoose = require('mongoose');
mongoose.connect(process.env.CONNECTIONSSTRING)
    .then(() => {
        app.emit('pronto');
    })
    .catch(e => console.log(e));

const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const routes = require('./routes')
const path = require('path');
const helmet = require('helmet');
const csrf = require('csurf');
const {middlewareGlobal, checkCsrfError, csrfMiddleware} = require('./src/middleware/middleware');

app.use(helmet());
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static(path.resolve(__dirname, 'public')));

const sessionOptions = session({
    secret: 'asdfgclkjh',
    store: MongoStore.create({mongoUrl: process.env.CONNECTIONSSTRING}),
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,    // 7 dias em millesimos de segundos
        httpOnly: true
    }
});
app.use(sessionOptions);
app.use(flash());

app.set('views', path.resolve(__dirname, 'src', 'views'));
app.set('view engine', 'ejs');

app.use(csrf());

// Nossoa Proprios middlewares
app.use(middlewareGlobal);
app.use(checkCsrfError);
app.use(csrfMiddleware);
app.use(routes);

// fica escutando a porta 3000
app.on('pronto', () => {
    app.listen(3000, () => {
        console.log('Acessar http://localhost:3000')
        console.log('servidor executando na porta 3000');
    });
});
