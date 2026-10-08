console.log("Map JS loaded");
console.log("Token:", mapToken);
console.log("Coordinates:", coordinates);

mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v12",
    center: coordinates,
    zoom: 9
});

const marker = new mapboxgl.Marker()
    .setLngLat(coordinates)
    .addTo(map);