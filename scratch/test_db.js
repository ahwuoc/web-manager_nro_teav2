const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'ngocrongmup.online',
  user: 'ahwuocdz',
  password: 'Ahwuocdz@_123123',
  database: 'nro_v2',
  port: 3306,
  ssl: {
    rejectUnauthorized: false
  }
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting: ' + err.stack);
    process.exit(1);
  }
  console.log('Connected as id ' + connection.threadId);
  connection.query('SELECT 1', (error, results, fields) => {
    if (error) throw error;
    console.log('Query result: ', results);
    connection.end();
  });
});
