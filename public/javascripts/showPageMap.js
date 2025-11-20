(function () {
  // Defensive initialization: log key and avoid throwing if SDK/key/container missing
  try {
    console.log("MAPTILER KEY (client):", typeof maptilerApiKey !== 'undefined' ? maptilerApiKey : null);
    if (typeof maptilersdk === "undefined") {
      console.error("maptilersdk is not loaded. Map will not initialize.");
      return;
    }
    if (!maptilerApiKey) {
      console.error("Missing MAPTILER_API_KEY on the client. Map will not initialize.");
      return;
    }
    const container = document.getElementById("map");
    if (!container) {
      console.warn("Map container with id 'map' not found in DOM.");
      return;
    }

    maptilersdk.config.apiKey = maptilerApiKey;

    const map = new maptilersdk.Map({
      container: "map",
      style: maptilersdk.MapStyle.STREET,
      center: campground.geometry.coordinates, // starting position [lng, lat]
      zoom: 10, // starting zoom
    });

    new maptilersdk.Marker()
      .setLngLat(campground.geometry.coordinates)
      .setPopup(
        new maptilersdk.Popup({ offset: 25 }).setHTML(
          `<h3>${campground.title}</h3><p>${campground.location}</p>`
        )
      )
      .addTo(map);
  } catch (err) {
    console.error("Error initializing MapTiler map:", err);
  }
})();
