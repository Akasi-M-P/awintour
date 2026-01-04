// EXPORT FUNCTION TO DISPLAY MAP
export const displayMap = (mapEl) => {
  // ONLY EXECUTE MAP LOGIC IF THE MAP ELEMENT EXISTS
  if (!mapEl) return;

  // PARSE LOCATIONS DATA PASSED FROM THE SERVER VIA DATA ATTRIBUTE
  const locations = JSON.parse(mapEl.dataset.locations);

  // DISABLE BROWSER SCROLL RESTORATION TO PREVENT AUTO-SCROLLING
  window.history.scrollRestoration = "manual";

  // SET MAPBOX ACCESS TOKEN
  mapboxgl.accessToken =
    "pk.eyJ1IjoiY29kZS12ZXJzYSIsImEiOiJjbWp5YmpraHo1bHZyM2RzNTVtMW9tNHgwIn0.tfNyreQP33ZjpXtTFMAsyA";

  // INITIALIZE MAPBOX MAP
  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v12",
    scrollZoom: false,
  });

  // CREATE BOUNDS TO FIT ALL LOCATIONS
  const bounds = new mapboxgl.LngLatBounds();

  // LOOP THROUGH LOCATIONS
  locations.forEach((loc) => {
    // CREATE MARKER ELEMENT
    const el = document.createElement("div");
    el.className = "marker";

    // ADD MARKER
    new mapboxgl.Marker({ element: el, anchor: "bottom" })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // ADD POPUP
    new mapboxgl.Popup({ offset: 20 })
      .setLngLat(loc.coordinates)
      .setHTML(`<p class="mapbox-popup">Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // EXTEND MAP BOUNDS
    bounds.extend(loc.coordinates);
  });

  // FIT MAP TO ALL MARKERS
  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });

  // FORCE SCROLL TO TOP AFTER MAP LOAD
  requestAnimationFrame(() => {
    window.scrollTo(0, 0);
  });
};
