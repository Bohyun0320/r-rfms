// postgreSQL settings
module.exports = {
    host: 'geocapture.co.kr',
    database: 'agros_net_db_dev', 
    user: 'argos_webserver',
    password: 'argospw1!', 
    port: 5432, 
    max: 10, // max number of connection can be open to database
    idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
};