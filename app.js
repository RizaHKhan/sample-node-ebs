/**
 * Module dependencies.
 */
const { Client } = require("pg");
const express = require("express"),
  routes = require("./routes"),
  user = require("./routes/user"),
  hike = require("./routes/hike"),
  http = require("http"),
  path = require("path"),
  pg = require("pg"),
  async = require("async");

var app = express();

app.configure(function () {
  app.set("port", process.env.PORT || 3000);
  app.set("views", __dirname + "/views");
  app.set("view engine", "jade");
  app.use(express.favicon());
  app.use(express.logger("dev"));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, "public")));
});

app.configure("development", function () {
  console.log("Using development settings.");
  app.set(
    "connection",
    new Client({
      user: "rizakhan",
      host: "localhost",
      database: "example",
      password: "",
      port: 5432,
    })
  );
  app.use(express.errorHandler());
});

// https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/create-deploy-nodejs.rds.html
app.configure("production", function () {
  console.log("Using production settings.");
  app.set(
    "connection",
    new Client({
      host: process.env.RDS_HOSTNAME,
      user: process.env.RDS_USERNAME,
      password: process.env.RDS_PASSWORD,
      database: process.env.RDS_DB_NAME,
      port: process.env.RDS_PORT,
    })
  );
});

function init() {
  app.get("/", routes.index);
  app.get("/users", user.list);
  app.get("/hikes", hike.index);
  app.post("/add_hike", hike.add_hike);

  http.createServer(app).listen(app.get("port"), function () {
    console.log("Express server listening on port " + app.get("port"));
  });
}

var client = app.get("connection");
async.series(
  [
    // function create_db(callback) {
    //   client.query("CREATE DATABASE luan", callback);
    // },
    // function use_db(callback) {
    //   client.query("USE luan", callback);
    // },
    function connect(callback) {
      client.connect(callback);
    },
    function clear(callback) {
      client.query("DROP TABLE IF EXISTS hikes", callback);
    },
    function create_table(callback) {
      client.query(
        "CREATE TABLE HIKES (" +
          "ID VARCHAR(40), " +
          "HIKE_DATE DATE, " +
          "NAME VARCHAR(40), " +
          "DISTANCE VARCHAR(40), " +
          "LOCATION VARCHAR(40), " +
          "WEATHER VARCHAR(40), " +
          "PRIMARY KEY(ID))",
        callback
      );
    },
    function insert_default(callback) {

      var hike = [
        "123456",
        new Date(),
        "Hazard Stevens",
        "Mt Rainier",
        "4,027m vertical",
        "Bad",
      ];
      
      client.query(
        "INSERT INTO HIKES(ID, HIKE_DATE, NAME, LOCATION, DISTANCE, WEATHER) VALUES($1, $2, $3, $4, $5, $6) RETURNING *",
        hike,
        callback
      );
    },
  ],
  function (err, results) {
    if (err) {
      console.log("Exception initializing database.");
      throw err;
    } else {
      console.log("Database initialization complete.");
      init();
    }
  }
);
