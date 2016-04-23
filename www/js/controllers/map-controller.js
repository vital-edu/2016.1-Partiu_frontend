var app = angular.module('starter');

app.controller('mapCtrl', function($scope, $ionicLoading, $compile) {
  $scope.marker = [];
  $scope.map;
  var origin_place_id = null;
  var destination_place_id = null;
  var travel_mode = google.maps.TravelMode.DRIVING;
  var directionsService = new google.maps.DirectionsService;
  var directionsDisplay = new google.maps.DirectionsRenderer;
  var mapDiv = document.getElementById("map");
  var origin_input = document.getElementById('origin-input');
  var destination_input = document.getElementById('destination-input');
  var find_me = document.getElementById('findMe');
  $scope.geolocation = {lat: -15.989091, lng: -48.045011};
  $scope.destiny = {lat: -15.802255, lng: -47.939872};
  $scope.img = [
    {sobrenatural: 'img/cars/sobrenatural.png'},
    {fusca: 'img/cars/fusca.png'}
  ];
  $scope.infoHtml =  '<div id="content">'+
                    '<h3 class="infoHtml">Partiu!</h3>'+
                    '<div id="bodyContent">'+
                      '<p>Casa</p>'+
                    '</div>' +
                  '</div>';


  //Cria o marcador do mapa
  $scope.createIcon = function(map, position, info) {
      $scope.marker = new google.maps.Marker({
        position: position,
        animation: google.maps.Animation.DROP,
        icon: $scope.img[0].sobrenatural,
        draggable: false,
      });
      $scope.marker.setMap(map);
      $scope.marker.addListener('click', toggleBounce);
      infoWindow(map, info);
  };

  //Faz o marcadore pular ao ser clicado
  var toggleBounce = function() {
    if ($scope.marker.getAnimation() !== null) {
      $scope.marker.setAnimation(null);
    } else {
      $scope.marker.setAnimation(google.maps.Animation.BOUNCE);
    }
  };

  //Deleta um marcador
  $scope.deleteIcon = function() {
    $scope.marker.setMap(null);
  };

  //Cria uma janela de informação ao clicar no marcador
  var infoWindow = function(map, info) {
    var infowindow = new google.maps.InfoWindow({
      content:info,
      maxWidth: 200
    });
    google.maps.event.addListener($scope.marker, 'click', function() {
      infowindow.open(map, $scope.marker);
    });
  };

  // Pega as informações de trafego das vias
  $scope.getTraficInformation = function(map) {
    var trafficLayer = new google.maps.TrafficLayer();
    trafficLayer.setMap(map);
  }

  // Localiza o usuário
  $scope.centerOnMe = function() {
    if(!$scope.map) {
      return;
    }

    $scope.deleteIcon();

    $scope.loading = $ionicLoading.show({
      content: 'Procurando posição atual...',
      showBackdrop: false
    });

    navigator.geolocation.getCurrentPosition(function(pos) {
      $scope.position = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude)
      $scope.map.setCenter($scope.position);
      $ionicLoading.hide();
      $scope.createIcon($scope.map, $scope.position, $scope.infoHtml);
    }, function(error) {
      alert('A posição atual não foi encontrada: ' + error.message);
    });
  };

  // Organizar o formulario dentro do mapa
  $scope.organizeInputs = function(map) {
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(origin_input);
    map.controls[google.maps.ControlPosition.LEFT_TOP].push(destination_input);
    map.controls[google.maps.ControlPosition.LEFT_TOP].push(find_me);

  }

  // Expandir a vista para caber no mapa  caso necessario
  var expandViewportToFitPlace = function(map, place) {
    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport);
    } else {
      map.setCenter(place.geometry.location);
      map.setZoom(17);
    }
  }

  // Calcula a rota entre a origem e o destino
  var route = function(origin_place_id, destination_place_id, travel_mode) {
    if (!origin_place_id || !destination_place_id) {
      return;
    }
    $scope.request = {
      origin: {'placeId': origin_place_id},
      destination: {'placeId': destination_place_id},
      travelMode: travel_mode
    }
    $scope.deleteIcon();
    // $scope.createIcon($scope.map, getLocation($scope.request.origin), $scope.infoHtml);
    directionsService.route($scope.request, function(response, status) {
      if (status === google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(response);
      } else {
        window.alert('Directions request failed due to ' + status);
      }
    });
  }

  // Autocompleta o formulario de origin e destino
  $scope.autocompleteRoute = function(map) {
    // ORIGEM AUTOCOMPLETE
    var origin_autocomplete = new google.maps.places.Autocomplete(origin_input);
    origin_autocomplete.bindTo('bounds', map);

    origin_autocomplete.addListener('place_changed', function() {
      var place = origin_autocomplete.getPlace();
      if (!place.geometry) {
        window.alert("Autocomplete's returned place contains no geometry");
        return;
      }
      expandViewportToFitPlace(map, place);

      origin_place_id = place.place_id;
      route(origin_place_id, destination_place_id, travel_mode,
            directionsService, directionsDisplay);
    });
    // DESTINATION AUTOCOMPLETE
    var destination_autocomplete = new google.maps.places.Autocomplete(destination_input);
    destination_autocomplete.bindTo('bounds', map);

    destination_autocomplete.addListener('place_changed', function() {
      var place = destination_autocomplete.getPlace();
      if (!place.geometry) {
        window.alert("Autocomplete's returned place contains no geometry");
        return;
      }
      expandViewportToFitPlace(map, place);

      destination_place_id = place.place_id;
      route(origin_place_id, destination_place_id, travel_mode,
            directionsService, directionsDisplay);
    });
  }

  // Converter localização atual na localização do Google Maps
  var getLocation = function(location) {
      if (location == null) return new google.maps.LatLng(-15.989091, -48.045011);
      if (angular.isString(location)) location = scope.$eval(location);
      return new google.maps.LatLng(location.lat, location.lon);
  }

  $scope.initialize = function(element) {

    var mapOptions = {
      center: $scope.geolocation,
      zoom: 16,
      mapTypeControl: false,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
    };
    var map = new google.maps.Map(element, mapOptions);
    directionsDisplay.setMap(map);

    $scope.createIcon(map, $scope.geolocation, $scope.infoHtml);

    $scope.getTraficInformation(map);

    $scope.organizeInputs(map);

    $scope.autocompleteRoute(map);

    $scope.map = map;
  };

});
