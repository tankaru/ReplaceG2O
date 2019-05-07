// https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
function deg2rad(deg) {
  return deg / 360 * 2 * Math.PI;
}

function rad2deg(rad) {
  return rad / 2 / Math.PI * 360.0;
}

function getTileNumber(lat, lon, zoom) {
  xtile = Math.round((lon + 180.0) / 360.0 * 2 ** zoom);
  ytile = Math.round((1 - Math.log(Math.tan(deg2rad(lat)) + 1 / (Math.cos(deg2rad(lat)))) / Math.PI) / 2 * 2 ** zoom);
  return [xtile, ytile];
}

function getLonLat(xtile, ytile, zoom) {
  n = 2 ** zoom;
  lon = xtile / n * 360.0 - 180.0;
  lat = rad2deg(Math.atan(Math.sinh(Math.PI * (1 - 2 * ytile / n))));
  return [lon, lat];
}

function LonLat_to_bbox(lat, lon, zoom) {
  width = 600;
  height = 450;
  tile_size = 256;

  [xtile, ytile] = getTileNumber(lat, lon, zoom);

  xtile_s = (xtile * tile_size - width / 2) / tile_size;
  ytile_s = (ytile * tile_size - height / 2) / tile_size;
  xtile_e = (xtile * tile_size + width / 2) / tile_size;
  ytile_e = (ytile * tile_size + height / 2) / tile_size;

  [lon_s, lat_s] = getLonLat(xtile_s, ytile_s, zoom);
  [lon_e, lat_e] = getLonLat(xtile_e, ytile_e, zoom);

  return [lon_s, lat_s, lon_e, lat_e];
}

//make a bbox, 0.001 should be modified based on zoom value
function bbox(lat, lon, zoom) {
  return LonLat_to_bbox(lat, lon, zoom);

}

function zoom(satelliteZoom) {
  return -1.4436 * Math.log(satelliteZoom) + 28.7;
}


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {

    var elms = document.querySelectorAll('iframe[src]');
    //extract all iframe with src

    for (var i = 0; i < elms.length; i++) {
      var elm = elms.item(i);
      var url = String(elm.getAttribute('src'));
      var match = url.match(/!1d(-?\d[0-9.]*)!2d(-?\d[0-9.]*)!3d(-?\d[0-9.]*)/);
      //extract zoom, lon, lat values from embedded google map url
      //zoom value is satellite view style, need to convert

      //alert(success);

      if (match) {
        var [, z, lon, lat] = match;
        var [mapleft, mapbottom, mapright, maptop] = bbox(Number(lat), Number(lon), zoom(z));
        //alert([mapleft, mapbottom, mapright, maptop]);
        var osmurl = 'https://www.openstreetmap.org/export/embed.html?bbox=' + mapleft + '%2C' + mapbottom + '%2C' + mapright + '%2C' + maptop + '&amp;layer=mapnik';
        elm.setAttribute('src', osmurl);
        //replace src value of iframe to OSM embed code
      }



    }
  }
)
