// Emptied out password and username as requested.
var mysql = require('mysql');
var pool = mysql.createPool({
  connectTimeout  : 1000000,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : XXXXXXX,
  password        : XXXXXXX,
  database        : XXXXXXX,
  dateStrings: 'date'
});
module.exports.pool = pool;