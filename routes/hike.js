var uuid = require('node-uuid');
exports.index = function(req, res) {
  res.app.get('connection').query( 'SELECT * FROM HIKES', function(err,
response) {
    if (err) {
      res.send(err);
    } else {
      console.log(JSON.stringify(response.rows, null, 4));
      res.render('hike', {title: 'My Hiking Log', hikes: response.rows});
  }});
};
exports.add_hike = function(req, res){
  var input = req.body.hike;
  // var hike = { HIKE_DATE: new Date(), ID: uuid.v4(), NAME: input.NAME,
  // LOCATION: input.LOCATION, DISTANCE: input.DISTANCE, WEATHER: input.WEATHER};
  var hike = [
    uuid.v4(),
    new Date(),
    input.NAME,
    input.LOCATION,
    input.DISTANCE,
    input.WEATHER
  ];
  console.log('Request to log hike:' + JSON.stringify(hike, null, 2));
  
  // client.query(
  //   "INSERT INTO HIKES(ID, HIKE_DATE, NAME, LOCATION, DISTANCE, WEATHER) VALUES($1, $2, $3, $4, $5, $6) RETURNING *",
  //   hike,
  //   callback
  // );
  req.app.get('connection')
    .query(
      "INSERT INTO HIKES(ID, HIKE_DATE, NAME, LOCATION, DISTANCE, WEATHER) VALUES($1, $2, $3, $4, $5, $6) RETURNING *",
      hike,
      function(err) {
        if (err) {
          console.log(err);
          res.send(err);
        } else {
          res.redirect('/hikes');
        }
    });
};
