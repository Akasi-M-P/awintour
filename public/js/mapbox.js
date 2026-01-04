// SELECT THE MAP CONTAINER ELEMENT FROM THE DOM
const mapEl = document.getElementById("map");

// ONLY EXECUTE MAP LOGIC IF THE MAP ELEMENT EXISTS ON THE PAGE
if (mapEl) {
  // PARSE LOCATIONS DATA PASSED FROM THE SERVER VIA DATA ATTRIBUTE
  const locations = JSON.parse(mapEl.dataset.locations);

  // DISABLE BROWSER SCROLL RESTORATION TO PREVENT AUTO-SCROLLING
  window.history.scrollRestoration = "manual";

  // SET MAPBOX ACCESS TOKEN
  mapboxgl.accessToken =
    "pk.eyJ1IjoiY29kZS12ZXJzYSIsImEiOiJjbWp5YmpraHo1bHZyM2RzNTVtMW9tNHgwIn0.tfNyreQP33ZjpXtTFMAsyA";

  // INITIALIZE MAPBOX MAP
  const map = new mapboxgl.Map({
    container: "map", // HTML ELEMENT ID WHERE MAP WILL RENDER
    style: "mapbox://styles/mapbox/streets-v12", // MAP STYLE
    scrollZoom: false, // DISABLE SCROLL ZOOM TO PREVENT PAGE INTERFERENCE
  });

  // CREATE BOUNDING BOX TO FIT ALL LOCATIONS ON THE MAP
  const bounds = new mapboxgl.LngLatBounds();

  // LOOP THROUGH EACH LOCATION AND ADD MARKERS AND POPUPS
  locations.forEach((loc) => {
    // CREATE CUSTOM MARKER ELEMENT
    const el = document.createElement("div");
    el.className = "marker";

    // ADD MARKER TO MAP
    new mapboxgl.Marker({
      element: el,
      anchor: "bottom",
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // ADD POPUP FOR EACH LOCATION
    new mapboxgl.Popup({
      offset: 20,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p class="mapbox-popup">Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // EXTEND MAP BOUNDS TO INCLUDE CURRENT LOCATION
    bounds.extend(loc.coordinates);
  });

  // ADJUST MAP VIEW TO FIT ALL MARKERS WITH PADDING
  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });

  // FORCE PAGE SCROLL TO TOP AFTER MAP RENDER TO PREVENT AUTO-SCROLL
  requestAnimationFrame(() => {
    window.scrollTo(0, 0);
  });
}
