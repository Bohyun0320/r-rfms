// JWT secret key
module.exports = {
  authKey : 'authorization',
  secret : 'safety-jwt-geo-mp',
  option : {
    algorithm : 'HS512',
    expiresIn : '4000h'
  }
};