(function () {
  try {
    const container = document.getElementById("map");
    const dataElement = document.getElementById("campground-data");
    if (!container || !dataElement || typeof L === "undefined") return;

    const campground = JSON.parse(dataElement.textContent);
    const coordinates = campground?.geometry?.coordinates;
    if (
      !Array.isArray(coordinates) ||
      coordinates.length < 2 ||
      !coordinates.every(Number.isFinite)
    ) {
      console.error("The campground does not have valid map coordinates.");
      return;
    }

    const latLng = [coordinates[1], coordinates[0]];
    const map = L.map(container).setView(latLng, 10);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const popup = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = campground.title;
    const location = document.createElement("p");
    location.textContent = campground.location;
    popup.append(title, location);

    L.marker(latLng, {
      title: campground.title,
      alt: `Location of ${campground.title}`,
    })
      .bindPopup(popup)
      .addTo(map);
  } catch (error) {
    console.error("Error initializing the campground map:", error);
  }
})();
