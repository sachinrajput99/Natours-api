/* eslint-disable*/

// const location1 = JSON.parse(document.getElementById('map').dataset.locations);
// console.log(location1);

export const displayMap = location1 => {
  //map initialization
  const map = L.map('map').setView([34.0522, -118.2437], 10); // [latitude, longitude] (LA coordinates)

  // osm layer
  var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 30,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  osm.addTo(map);

  // Create a bounds object
  const bounds = L.latLngBounds();
  // console.log('bound',bounds);

  // // Loop through locations and add markers and pop-ups
  location1.forEach(location => {
    // Create a marker with correct coordinate order
    //    Leaflet expects coordinates in the format [latitude, longitude]
    // we are providing in [longitude, latitude].
    const marker = L.marker([
      location.coordinates[1],
      location.coordinates[0]
    ]).addTo(map);

    // Extend bounds with current location
    bounds.extend([location.coordinates[1], location.coordinates[0]]);

    // Create a popup
    marker.bindPopup(`<p>${location.day}: ${location.description}</p>`);
  });

  console.log(bounds);

  // Fit map to bounds with padding
  map.fitBounds(bounds, { padding: [20, 20] });

  // Disable scroll zoom
  map.scrollWheelZoom.disable();
};
// /////////////////////////////////////////////map initialization
// const map = L.map('map').setView([34.0522, -118.2437], 10); // [latitude, longitude] (LA coordinates)

// // osm layer
// var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
//   maxZoom: 30,
//   attribution:
//     '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
// }).addTo(map);

// osm.addTo(map);

// // Create a bounds object
// const bounds = L.latLngBounds();
// // console.log('bound',bounds);

// // // Loop through locations and add markers and pop-ups
// location1.forEach(location => {
//   // Create a marker with correct coordinate order
//   //    Leaflet expects coordinates in the format [latitude, longitude]
//   // we are providing in [longitude, latitude].
//   const marker = L.marker([
//     location.coordinates[1],
//     location.coordinates[0]
//   ]).addTo(map);

//   // Extend bounds with current location
//   bounds.extend([location.coordinates[1], location.coordinates[0]]);

//   // Create a popup
//   marker.bindPopup(`<p>${location.day}: ${location.description}</p>`);
// });

// console.log(bounds);

// // Fit map to bounds with padding
// map.fitBounds(bounds, { padding: [20, 20] });

// // Disable scroll zoom
// map.scrollWheelZoom.disable();
