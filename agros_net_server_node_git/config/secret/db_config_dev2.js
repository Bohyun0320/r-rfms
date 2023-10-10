// postgreSQL settings
module.exports = {
  host: 'dtgeo.iptime.org',
  database: 'agros_net_db_dev', 
  user: 'argos_webserver',
  password: 'argospw1!', 
  port: 5424, 
  max: 10, // max number of connection can be open to database
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
};