(function () {
  try {
    const container = document.getElementById("cluster-map");
    const dataElement = document.getElementById("campgrounds-data");
    if (!container || !dataElement || typeof L === "undefined") return;

    const campgrounds = JSON.parse(dataElement.textContent);
    const map = L.map(container, { worldCopyJump: true }).setView([20, 0], 2);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const markers = L.markerClusterGroup({
      maxClusterRadius: 50,
      disableClusteringAtZoom: 15,
    });

    campgrounds.forEach((campground) => {
      const coordinates = campground?.geometry?.coordinates;
      if (
        !Array.isArray(coordinates) ||
        coordinates.length < 2 ||
        !coordinates.every(Number.isFinite)
      ) {
        return;
      }

      const popup = document.createElement("div");
      const link = document.createElement("a");
      link.href = `/campgrounds/${encodeURIComponent(campground._id)}`;
      link.textContent = campground.title;
      const title = document.createElement("strong");
      title.appendChild(link);
      const description = document.createElement("p");
      const summary = String(campground.description || "");
      description.textContent = summary.length > 35 ? `${summary.slice(0, 35)}...` : summary;
      popup.append(title, description);

      markers.addLayer(
        L.marker([coordinates[1], coordinates[0]], {
          title: campground.title,
          alt: `Location of ${campground.title}`,
        }).bindPopup(popup)
      );
    });

    map.addLayer(markers);
    if (markers.getLayers().length) {
      map.fitBounds(markers.getBounds(), { padding: [30, 30], maxZoom: 10 });
    }
  } catch (error) {
    console.error("Error initializing the campground cluster map:", error);
  }
})();
