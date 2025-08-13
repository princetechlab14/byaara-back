require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const compression = require('compression');
const cors = require("cors");
const db = require("./models");
const path = require('path');
const bodyParser = require('body-parser');
const logger = require('morgan');
const cookieParser = require('cookie-parser');

const indexRouter = require('./routes/index');
const adminRouter = require('./routes/admin');
const apiRouter = require('./routes/api');

const allowedOrigins = [
  'http://localhost:7005',
  'http://localhost:7009',
  'http://localhost:5013',
  'http://localhost:5046',
  'https://android.web-gamer.com',
];

const app = express();
app.use(compression());

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  // exposedHeaders: ['Content-Length', 'X-Known-Header'],
  credentials: true,
  // preflightContinue: false,
  // optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Database start
const synchronizeAndSeed = async () => {
  try {
    await db.sequelize.sync({ force: true });
    // await db.sequelize.sync();
    await require("./seeder/admin-seeder").admin();
  } catch (error) {
    console.error("Error during synchronization and seeding:", error);
  }
};
// synchronizeAndSeed();
// Database end


app.use('/admin', adminRouter);
app.use('/', indexRouter);
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});