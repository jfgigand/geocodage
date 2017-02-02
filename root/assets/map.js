var overlayLayer, overlayLayerSource;

var map;
var vectorSource;
var ignApiKey = "ksdf04gogvativv0cel5eenx";
var layerSwitcher;
var adresse, noFirstResultsOnly;

function recenterMap() {
  map.getView().fit(vectorSource.getExtent(), map.getSize());
}
/**
 * Create vector layer with all features from geocoding results (called by checkProcessing())
 */
function createVectorLayer(map, features) {
  vectorSource = new ol.source.Vector({
    features: features,
    // projection: "EPSG:4326",
  });

  var vectorLayer = new ol.layer.Vector({
    source: vectorSource,
    // projection: ol.proj.get("EPSG:4326")
  });
  map.addLayer(vectorLayer);

  layerSwitcher.addLayer(vectorLayer, {
    title: "Adresses géocodées",
    description: "Localisation des résultats du géocodage de l’adresse «&nbsp;"+adresse+"&nbsp;»"
  });

  // layerSwitcher.addLayer({
  //   layer: vectorLayer,
  //   config: {
  //     title: "Adresses géocodées",
  //     description: "Localisation des résultats du géocodage de l’adresse «&nbsp;"+adresse+"&nbsp;»"
  //   }
  // });

  // var clusterSource = new ol.source.Cluster({
  //   distance: 40,
  //   source: vectorSource
  // });
  // var styleCache = {};
  // var clusterLayer = new ol.layer.Vector({
  //   source: clusterSource,
  //   style: function(feature) {
  //     var size = feature.get('features').length;
  //     var style = styleCache[size];
  //     if (!style) {
  //       style = new ol.style.Style({
  //         image: new ol.style.Circle({
  //           radius: 10,
  //           stroke: new ol.style.Stroke({
  //             color: '#fff'
  //           }),
  //           fill: new ol.style.Fill({
  //             color: '#3399CC'
  //           })
  //         }),
  //         text: new ol.style.Text({
  //           text: size.toString(),
  //           fill: new ol.style.Fill({
  //             color: '#fff'
  //           })
  //         })
  //       });
  //       styleCache[size] = style;
  //     }
  //     return style;
  //   }
  // });
  // map.addLayer(clusterLayer);

  overlayLayerSource = new ol.source.Vector({
  });

  overlayLayer = new ol.layer.Vector({
    source: overlayLayerSource
    // projection: ol.proj.get("EPSG:4326")
  });
  map.addLayer(overlayLayer);
  layerSwitcher.addLayer(overlayLayer, {
    title: "Sélection",
  });

  recenterMap(map, vectorSource);
}

var currentFeature;

/**
 * Main function, called from <script> tag
 */
function init_geocodage(_adresse, _noFirstResultsOnly) {
  noFirstResultsOnly = _noFirstResultsOnly;
  adresse = _adresse;
  Gp.Services.getConfig({
    apiKey: ignApiKey,
    onSuccess: init_map.bind(null, adresse)
  });
}

function init_map(adresse) {
  console.log("init");
  document.getElementById("search").select();
  containerNode = document.getElementById("result-container");
  var orthophoto = new ol.layer.GeoportalWMTS({
    layer: "ORTHOIMAGERY.ORTHOPHOTOS"
  });
  var scanExpressStandard = new ol.layer.GeoportalWMTS({
    layer: "GEOGRAPHICALGRIDSYSTEMS.MAPS.SCAN-EXPRESS.STANDARD",
    opacity: 0.5
  });

  map = new ol.Map({
    target: 'map',
    layers: [
      orthophoto,
      scanExpressStandard,
      // new ol.layer.GeoportalWMTS({
      //   layer: "GEOGRAPHICALGRIDSYSTEMS.MAPS.SCAN-EXPRESS.CLASSIQUE"
      // }),
      // new ol.layer.GeoportalWMTS({
      //   layer: "GEOGRAPHICALGRIDSYSTEMS.MAPS.SCAN-EXPRESS.NIVEAUXGRIS"
      // }),
      // new ol.layer.Tile({
      //   source: new ol.source.OSM()
      // })
    ],
    view: new ol.View({
      center: ol.proj.fromLonLat([2.42472, 46.76306]),
      // projection: "EPSG:3857",
      // projection: "EPSG:2154",
      zoom: 6
    })
  });
  scanExpressStandard.setOpacity(0.5);


  layerSwitcher = new ol.control.LayerSwitcher({
    layers : [{
      layer: scanExpressStandard,
      config: {
        title: "IGN Scan Express (standard)",
        // description: ""
      }
    }]
  });
  map.addControl(layerSwitcher);
  var search = new ol.control.SearchEngine({}) ;
  map.addControl(search);
  var att = new ol.control.GeoportalAttribution({});
  map.addControl(att);
  var reverse = new ol.control.ReverseGeocode({});
  map.addControl(reverse);

  map.on('click', function(evt) {

    var feature = map.forEachFeatureAtPixel(
      evt.pixel, function(feature, layer) { return feature; });

    if (feature && feature.selectAdresse) {
      feature.selectAdresse();
    } else {
      if (currentFeature) {
        currentFeature.unselectAdresse();
      }
    }
  });

  var features = [];
  var processing = {};

  function checkProcessing() {
    if (!Object.keys(processing).some(function(p) { return processing[p] === true; })) {
      createVectorLayer(map, features);
    }
  }

  //////////////////////////////////////////////////////////////////////
  // Google Geocoding API

  var client = new XMLHttpRequest();
  client.addEventListener('load', function(event) {
    var client = event.target;
    var response = JSON.parse(client.responseText);
    console.log("GMaps API", event, response);

    var iconStyle = new ol.style.Style({
      image: new ol.style.Icon({
        anchor: [46, 25],
        anchorXUnits: 'pixels',
        anchorYUnits: 'pixels',
        scale: 1,
        opacity: 1,
        src: '/assets/img/geocode-gmaps.png'
      }),
    });

    limitResults(response.results).forEach(function(result) {
      var feature = makeFeature([result.geometry.location.lng, result.geometry.location.lat], {
        api: "google",
        formatted_address: result.formatted_address,
        hierarchical_address: result.address_components
          .map(function(component) { return component.long_name; })
          .join(" > "),
        precision: result.geometry.location_type,
        id: result.place_id,
      });
      feature.setStyle(iconStyle);
      features.push(feature);
    });
    processing.gmaps = false;
    checkProcessing();
  });
  client.addEventListener('error', function() {
    alert("Failure on Google API");
  });
  client.open('GET', "https://maps.googleapis.com/maps/api/geocode/json"+
              "?key=AIzaSyCn689iihQ-WOcaqmTG1YKMZz38z2n5S9Q"+
              "&language=fr&components=country:FR" +
              "&address=" + encodeURIComponent(adresse));
  processing.gmaps = true;
  client.send();


  //////////////////////////////////////////////////////////////////////
  // Addok/BAN API

  var client = new XMLHttpRequest();
  client.addEventListener('load', function(event) {
    var client = event.target;
    var response = JSON.parse(client.responseText);
    console.log("Addok API", event, response);
    var iconStyle = new ol.style.Style({
      image: new ol.style.Icon(({
        anchor: [25, 4],
        anchorXUnits: 'pixels',
        anchorYUnits: 'pixels',
        scale: 1,
        opacity: 1,
        src: '/assets/img/geocode-ban.png'
      })),
      // text: new ol.style.Text({
      //   text: ""+Math.round(result.properties.score)+" %",
      //   fill: new ol.style.Fill({
      //     color: '#fff'
      //   })
      // })
    });

    limitResults(response.features).forEach(function(result) {
      var feature = makeFeature(result.geometry.coordinates, {
        api: "addok-ban",
        formatted_address: result.properties.label,
        precision: result.properties.type,
        score: result.properties.score,
        id: result.properties.id,
      });
      feature.setStyle(iconStyle);
      features.push(feature);
    });
    processing.addok = false;
    checkProcessing();
  });
  client.addEventListener('error', function() {
    alert("Failure on Addok/BAN");
  });
  client.open('GET', "http://api-adresse.data.gouv.fr/search/" +
              "?autocomplete=0" +
              "&q=" + encodeURIComponent(adresse));
  processing.addok = true;
  client.send();


  //////////////////////////////////////////////////////////////////////
  // IGN Geoportail OpenLS API

  processing.ign_openls = true;
  Gp.Services.geocode({
    apiKey : ignApiKey,
    location : adresse,
    // protocol: "XHR",
    // httpMethod: "POST",
    filterOptions : {
      type : ["StreetAddress", "PositionOfInterest"]
    },
    onSuccess : function (result) {
      console.log("IGN OpenLS API", result);
      var iconStyle = new ol.style.Style({
        image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
          anchor: [25, 46],
          anchorXUnits: 'pixels',
          anchorYUnits: 'pixels',
          scale: 1,
          opacity: 1,
          src: '/assets/img/geocode-ign.png'
        }))
      });

      limitResults(result.locations).forEach(function(result) {
        var feature = makeFeature([result.position.y, result.position.x], {
          api: "ign-openls",
          formatted_address: ["number", "street", "postalCode", "municipality"]
            .map(function(p) { return result.placeAttributes[p] || ""; })
            .join(" "),
          precision: result.matchType,
          score: result.accuracy,
          id: result.placeAttributes.ID,
        });
        feature.setStyle(iconStyle);
        features.push(feature);
      });
      processing.ign_openls = false;
      checkProcessing();
    }

  });
}

var containerNode;
// console.log("result node", containerNode);

var logos = {
  "google": "logo-gmaps.png",
  "addok-ban": "logo-ban.png",
  "ign-openls": "logo-ign.png",
};

function makeFeature(coordinates, attributes) {
  attributes.geometry = new ol.geom.Point(
    ol.proj.transform(coordinates, 'EPSG:4326', 'EPSG:3857'));
  // geometry: new ol.geom.Point([result.geometry.location.lng, result.geometry.location.lat]),

  var div = document.createElement("div");
  div.className = "result stopf "+attributes.api;
  var content = "";
  content += "<img src=\"/assets/img/"+logos[attributes.api]+"\" class=\"api-logo floatl\" width=\"20\"/>";
  content += "<div class=\"ref stopf\"><span class=\"precision floatr right\">"+
    attributes.precision+"<br/>"+(attributes.score?(Math.round(attributes.score * 100)+"&nbsp;%"):"")+"</span><a class=\"coords\">"+coordinates[0]+", "+coordinates[1]+"</a></div>";
  // content += "<h3>"+attributes.api+"</h3>";
  // content += "<div class=\"point stopf\"><span class=\"identifier floatr\">"+attributes.id+"</span><span class=\"formatted\">"+attributes.formatted_address+"</span></div>";

  content += "<div class=\"formatted\">"+attributes.formatted_address+"</div>";
  content += "<div class=\"identifier\">"+(attributes.id || "pas d’identifiant")+"</span>";
  // content += "<div class=\"precision\">"+attributes.precision+"</span>";
  div.innerHTML = content;

  var feature = new ol.Feature(attributes);
  feature.infoNode = div;
  feature.unselectAdresse = function() {
    currentFeature.infoNode.classList.remove("focus");
    if (feature.overlayFeature) {
      overlayLayerSource.removeFeature(feature.overlayFeature);
      feature.overlayFeature = null;
    }
  };
  feature.selectAdresse = function(fromList) {
    if (currentFeature) {
      currentFeature.unselectAdresse();
    }
    currentFeature = feature;
    feature.infoNode.classList.add("focus");
    var overlayStyle = new ol.style.Style({
      image: new ol.style.Circle({
        radius: 30,
        stroke: new ol.style.Stroke({
          color: '#800000',
          width: 3
        })
      })
    });
    var overlayFeature = new ol.Feature(feature.getGeometry());
    feature.overlayFeature = overlayFeature;
    overlayFeature.setStyle(overlayStyle);
    overlayLayerSource.addFeature(overlayFeature);

    if (fromList === true) {
      // zoom to feature
      map.getView().fit(ol.extent.buffer(feature.getGeometry().getExtent(), 200), map.getSize());
    }
  };

  div.onclick = function() {
    feature.selectAdresse(true);
  };
  containerNode.appendChild(div);

  return feature;
}

function makeXHR(url, onSuccess) {
}

function limitResults(array) {
  return noFirstResultsOnly ? array : array.slice(0, 1);
}
