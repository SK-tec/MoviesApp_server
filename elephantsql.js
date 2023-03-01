var pg = require('pg');
//or native libpq bindings
//var pg = require('pg').native


//var conString ="postgres://vnaxgcti:MDkPdaxYjnfXENbWi4beS8JlQmoR6q7U@satao.db.elephantsql.com/vnaxgcti" //Can be found in the Details page
require('dotenv').config()
var conString=process.env.CONNECTION_STRING;
var client = new pg.Client(conString);
client.connect(function(err) {
  if(err) {
    return console.error('could not connect to postgres', err);
  }
  client.query('SELECT * FROM movies', function(err, result) {
    if(err) {
      return console.error('error running query', err);
    }
    console.log(result.rows[1]);
    // >> output: 2018-08-23T14:02:57.117Z
    client.end();
  });
});