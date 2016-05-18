angular.module('starter.services', [])

.service('Profile', function() {
  var user = {}

  var setUser = function(name, email, token, gender, photoURL, userId, profileLink) {
    user.name = name,
    user.email = email,
    user.token = token,
    user.gender = gender,
    user.photo = photoURL,
    user.id = userId,
    user.facebook_profile = profileLink
  }

  var getUser = function() {
    return user;
  }

  return {
    setUser: setUser,
    getUser: getUser
  }
})

.factory('RideAPI', function($resource) {
  return $resource("http://104.236.252.208/api/users/1/rides/:rideID", null , {
    update: {
      method: 'PUT'
    }
  });
})

.factory('UserAPI', function($resource) {
  return $resource("http://104.236.252.208/api/users/:userID");
})

.factory('VehicleAPI', function($resource) {
  return $resource('http://104.236.252.208/api/users/1/vehicles/:vehicleID', null, {
    update: {
      method: 'PUT'
    }
  });
})

.factory('RegisterRide', function(RideAPI, VehicleAPI, $q, $rootScope){

  var service = {};

  service.register = function(ride, vehicle) {
    return $q(function(success, failure){
      if(ride.id) {
        RideAPI.update({rideID: ride.id}, ride, function() {
          success({
            message: "Carona " + ride.title + " foi atualizada com sucesso!",
            create: false
          });
        }, function(erro){
          console.log(erro.status);
          failure({
            message: "Não foi possivel editar a carona " + ride.title
          });
        });
      } else {
        RideAPI.save(ride, function() {
            success({
              message: "Carona " + ride.title + " incluída com sucesso",
              create: true
            });
        }, function(erro) {
            console.log(erro.status);
            failure({
              message: "Não foi possível incluír a carona " + ride.title
            });
        });
      }
    });
  };

  return service;

});
