/* -------------------------------------------------------------------------- */
/*                Mapbox URL, info to connect to Carto datasets               */
/* -------------------------------------------------------------------------- */
const basemapURL =
  "https://api.mapbox.com/styles/v1/ilabmedia/clesm3yxm000a01mtyumq5sp4/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiaWxhYm1lZGlhIiwiYSI6ImNpbHYycXZ2bTAxajZ1c2tzdWU1b3gydnYifQ.AHxl8pPZsjsqoz95-604nw";

const cartoKeyMarkers = "6KgYkqFnDfk6hEgC3TGvIw";
const cartoSourceMarkers = "russia_btg_map_all_time_data";

const cartoKeyLines = "SMgzGpUrfgPT5Fg25t9XNw";
const cartoSourceLines = "tnt_front_lines_time_slider";

/* -------------------------------------------------------------------------- */
/*                                Build the map                               */
/* -------------------------------------------------------------------------- */
var basemap = L.tileLayer(basemapURL, {});

var map = L.map("map", {
  center: [49.19953923337175, 34.57093513324714],
  zoom: 5.5,
  maxZoom: 20,
  scrollWheelZoom: true,
  minZoom: 4,
  zoomControl: false,
  scrollWheelZoom: true,
  zoomSnap: 0,
  zoomDelta: 0.5,
  layers: [basemap],
  attributionControl: false,
});

/* -------------------------------------------------------------------------- */
/*            Instantiate Overlapping Marker Spiderfier for Leaflet           */
/* -------------------------------------------------------------------------- */

let omsOptions = {
  keepSpiderfied: true,
  nearbyDistance: 35,
  circleSpiralSwitchover: 3,
};

const oms = new OverlappingMarkerSpiderfier(map, omsOptions);

/* -------------------------------------------------------------------------- */
/*                           Build the marker icons                           */
/* -------------------------------------------------------------------------- */

function getImages() {
  return new Promise((resolve, reject) => {
    let url = "tnt-russia-btg-map/map/js/markers.json";
    fetch(url)
      .then((res) => res.json())
      .then((markers) => {
        let markerIcon = "";
        let IconBase = L.Icon.extend({
          options: {
            iconSize: [45, 45],
            iconAnchor: [22, 40],
          },
        });
        let markerArr = [];

        for (let x in markers) {
          xLower = x.toLowerCase();
          let fullUrl = "tnt-russia-btg-map/map/images/" + x + ".svg";
          let filename2 = xLower
            .substring(xLower.lastIndexOf("/") + 1)
            .replace(/\.[^/.]+$/, ""); // File name no ext

          markerIcon = new IconBase({
            iconUrl: fullUrl,
            iconName: filename2,
          });

          markerArr.push(markerIcon);
        }

        resolve(markerArr);
      })
      .catch((error) => console.log("Error in getImages()! -->", error));
  });
}

/* -------------------------------------------------------------------------- */
/*         Sort marker icons by date and add to map; set up spiderfier        */
/* -------------------------------------------------------------------------- */

let markersByDate = {};
let markerLayerGroups = [];
let dates = [];

// get window width
let windowInnerWidth = window.innerWidth;
const desktop = 900;

Promise.all([getImages()]).then((markerArr) => {
  let sql = new cartodb.SQL({ user: "csis" });
  sql
    .execute("SELECT * FROM csis." + cartoSourceMarkers)
    .done(function (data) {
      const rows = data.rows;
      let latLngArr = [];

      /* Build markers, markersByDate, dates; add each marker to spiderfier */
      rows.forEach((row) => {
        let latLong = row.lat + ", " + row.long;
        let markerName = row.type.toLowerCase();

        if (!latLngArr.includes(latLong)) {
          latLngArr.push(latLong);
        } else {
          row.lat = row.lat + (Math.random() * (0.15 - 0.05) + 0.05);
          latLong = row.lat + ", " + row.long;
          latLngArr.push(latLong);
        }

        const foundMarkerIcon = markerArr[0].find((marker) => {
          return marker.options.iconName == markerName;
        });

        if (foundMarkerIcon) {
          let marker = L.marker([row.lat, row.long], {
            icon: foundMarkerIcon,
            riseOnHover: false,
            data: null,
          });

          marker.data = row;

          const dateInSec = new Date(marker.data.date).getTime();

          if (!dates.includes(dateInSec)) {
            dates.push(dateInSec);
          }

          if (dateInSec in markersByDate) {
            markersByDate[dateInSec].push(marker);
          } else {
            markersByDate[dateInSec] = [marker];
          }

          oms.addMarker(marker);
        } else {
          console.log("No marker for " + row.type);
        }
      });

      /* ----------------- Setup timeline in the map legend ----------------- */
      dates.sort();
      len = dates.length;

      timeline.setupTimeline({ start: dates[0], end: dates[len - 1] });

      /* ------------ Create dropdown; CSS only shows on mobile ------------ */

      populateSelect(dates[0]);

      /* ------------------- Build the marker layer groups ------------------ */
      for (array in markersByDate) {
        layerArray = L.layerGroup(markersByDate[array]);
        markerLayerGroups.push(layerArray);
      }

      /* -- Add starting marker layerGroup to map depending on window size -- */
      if (windowInnerWidth >= desktop) {
        map.addLayer(markerLayerGroups[0]);
      }

      if (windowInnerWidth < desktop) {
        map.addLayer(markerLayerGroups[markerLayerGroups.length - 1]);
      }

      /* ----------------- Set up spiderfier event listeners ---------------- */
      oms.addListener("click", function (marker) {
        if (marker.data.formal_name === "") {
          popup.setContent(
            "<p class='leaflet-popup-content--no-name'>Name not available</p>"
          );
        } else {
          popup.setContent(marker.data.formal_name);
        }
        popup.setLatLng(marker.getLatLng());
        map.openPopup(popup);
      });

      oms.addListener("spiderfy", function (markers) {
        map.closePopup();
      });
    })
    .error(function (errors) {
      console.log("errors:" + errors);
    });
});

/* -------------------------------------------------------------------------- */
/*                         Create and add front lines                         */
/* -------------------------------------------------------------------------- */

let lineArr = [];

fetch(
  `https://csis.carto.com/api/v2/sql?format=GeoJSON&api_key=${cartoKeyLines}&q=SELECT * FROM ${cartoSourceLines} ORDER BY date ASC`
)
  .then((res) => res.json())
  .then((response) => {
    response.features.forEach((row) => {
      const dateInSec = new Date(row.properties.date).getTime();

      row.properties.dateInSec = dateInSec;
      lineArr.push(
        L.geoJSON(row, {
          style: function (feature) {
            return { weight: 3, color: "#6d3738", opacity: 1 };
          },
          interactive: false,
        })
      );
    });
    /* ------- Add starting front line to map depending on window size ------ */
    if (windowInnerWidth >= desktop) {
      map.addLayer(lineArr[0]);
    }

    if (windowInnerWidth < desktop) {
      map.addLayer(lineArr[lineArr.length - 1]);
    }
  });

/* -------------------------------------------------------------------------- */
/*      Functions to add/remove marker and layer groups at the same time      */
/* -------------------------------------------------------------------------- */

function addLayerGroup(group) {
  return new Promise(function (resolve, reject) {
    resolve(map.addLayer(markerLayerGroups[group]).addLayer(lineArr[group]));
  });
}

function removeLayerGroup(group) {
  return new Promise(function (resolve, reject) {
    resolve(
      map.removeLayer(markerLayerGroups[group]).removeLayer(lineArr[group])
    );
  });
}

/* -------------------------------------------------------------------------- */
/*                     Popups, attribution, zoom position                     */
/* -------------------------------------------------------------------------- */

const popup = L.popup({ closeButton: true, offset: new L.Point(0, -20) });

L.control
  .attribution({
    position: "bottomleft",
  })
  .setPrefix(
    'Data by <a target="_blank" href="https://www.csis.org/programs/transnational-threats-project">CSIS Transnational Threats Program</a> | <a href="https://leafletjs.com/">Leaflet</a>'
  )
  .addTo(map);

L.control
  .zoom({
    position: "topright",
  })
  .addTo(map);

/* -------------------------------------------------------------------------- */
/*                       Legend Timeline and Play Button                      */
/* -------------------------------------------------------------------------- */

const timeline = {
  el: document.querySelector(".timeline-bar"),
  controlBtn: document.getElementById("timeline-btn"),
  currentDateEl: document.querySelector(".timeline-current-date"),
  playing: false,
  timer: null,
  transitionDuration: 2000,
  end: null,
  start: null,

  updateCurrentDate: function (currentDate) {
    this.currentDateEl.innerHTML = `${this.formatDate(currentDate)}`;
    selectChangeHandler();
    selectChangeText(currentDate, dates);
  },

  onChange: function onChange() {
    currentDate = this.get();
    timeline.updateCurrentDate(currentDate);

    map.closePopup();

    let dateIndex = dates.indexOf(currentDate);

    for (i = 0; i < len; i++) {
      if (i != dateIndex) {
        removeLayerGroup(i);
      }
    }

    addLayerGroup(dateIndex);

    if (currentDate == timeline.end) {
      timeline.stopTimeline();
    }
  },

  formatDate: function (currentDate) {
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    dateInSec = new Date(currentDate);

    formattedDate = new Date(
      dateInSec.getUTCFullYear(),
      dateInSec.getUTCMonth(),
      dateInSec.getUTCDate()
    );

    return `${
      monthNames[formattedDate.getMonth()]
    } ${formattedDate.getFullYear()}`;
  },

  setupTimeline: function ({ start, end }) {
    this.start = start;
    this.end = end;

    this.setupBtnControls();

    let range = {};

    dates.forEach((date, i) => {
      if (i === 0) {
        range["min"] = date;
      } else if (i === len - 1) {
        range["max"] = date;
      } else {
        let rangePercent =
          Math.floor(
            ((date - dates[0]) / (dates[len - 1] - dates[0])) * 100 + 0.5
          ) + "%";
        range[rangePercent] = date;
      }
    });

    noUiSlider.create(this.el, {
      start: this.start,
      connect: true,
      behaviour: "tap-drag",
      snap: true,
      range: range,
      format: {
        from: function from(v) {
          return parseInt(v, 10);
        },
        to: function to(v) {
          return parseInt(v, 10);
        },
      },
      pips: {
        mode: "count",
        values: len,
        density: 100,
        stepped: true,
        format: {
          to: this.formatDate,
        },
      },
    });
    this.el.noUiSlider.set(this.start);
    this.el.noUiSlider.on("update", this.onChange);
    this.el.noUiSlider.on("slide", function (values, handle) {
      let tempDate = new Date(values[handle]);
      tempDate = new Date(
        tempDate.getUTCFullYear(),
        tempDate.getUTCMonth(),
        tempDate.getUTCDate()
      ).getTime();

      timeline.el.noUiSlider.set(tempDate);
    });

    let pips = timeline.el.querySelectorAll(".noUi-value");

    function clickOnPip() {
      var value = Number(this.getAttribute("data-value"));
      timeline.el.noUiSlider.set(value);
    }

    for (var i = 0; i < pips.length; i++) {
      pips[i].addEventListener("click", clickOnPip);
    }
  },

  setupBtnControls: function () {
    this.controlBtn.addEventListener("click", function () {
      if (currentDate == timeline.end) {
        const lastDateIndex = len - 1;
        removeLayerGroup(lastDateIndex);
        timeline.el.noUiSlider.set(timeline.start);
      }

      if (timeline.playing == true) {
        timeline.stopTimeline();
        return;
      }

      let i = dates.indexOf(currentDate);

      function timelinePosition() {
        if (i >= dates.length) {
          i = 0;
        }

        currentDate = dates[i];
        timeline.el.noUiSlider.set(currentDate);
        i++;
      }
      timelinePosition();
      timeline.timer = setInterval(
        timelinePosition,
        timeline.transitionDuration
      );
      this.classList.remove("play-btn");
      this.classList.add("pause-btn");
      timeline.playing = true;
    });
  },

  stopTimeline: function () {
    clearInterval(timeline.timer);
    timeline.playing = false;
    timeline.controlBtn.classList.remove("pause-btn");
    timeline.controlBtn.classList.add("play-btn");
  },
};

/* -------------------------------------------------------------------------- */
/*                         Show/Hide Legend on Mobile                         */
/* -------------------------------------------------------------------------- */
let toolbox = document.getElementById("toolbox");
let viewLegendButton = document.querySelector(".view-legend");

let hideLegendButton = document.querySelector(".toolbox__close");
let hideLegendButtonMobile = document.querySelector(".toolbox__close");

function viewLegendHandler() {
  toolbox.classList.remove("display-none");
  viewLegendButton.classList.remove("display-block");
  viewLegendButton.classList.add("display-none");
}

function hideLegendHandler() {
  toolbox.classList.add("display-none");
  viewLegendButton.classList.remove("display-none");
  viewLegendButton.classList.add("display-block");
}

/* -------------------------------------------------------------------------- */
/*                          Dropdown menu for mobile                          */
/* -------------------------------------------------------------------------- */
const select = document.getElementById("dropdown");

/* --------------------- Setup dropdown when map created -------------------- */
function populateSelect() {
  dates.forEach((option, i) => {
    const optionEl = document.createElement("option");
    removeLayerGroup(i);
    if (i === len - 1) {
      optionEl.selected = " selected";
      addLayerGroup(i);
    }
    optionEl.value = i;

    // call format function in the timeline object to avoid duplicating it
    optionEl.text = timeline.formatDate(option);
    select.appendChild(optionEl);
  });

  select.addEventListener("change", selectChangeHandler);
}

/* ------------------------- Dropdown event handler ------------------------- */
function selectChangeHandler() {
  map.closePopup();

  let dateIndex = select.value;

  for (i = 0; i < len; i++) {
    if (i != dateIndex) {
      removeLayerGroup(i);
    }
  }

  addLayerGroup(dateIndex);

  return dates[dateIndex];
}

/* ----------- Update Dropdown choice when timeline choice changes ---------- */
function selectChangeText(currentDate, dates) {
  select.value = dates.indexOf(currentDate);
}

/* -------------------------------------------------------------------------- */
/*                           Handle Window Resizing                           */
/* -------------------------------------------------------------------------- */

// observe window resize
window.addEventListener("resize", resizeHandler);

// initial call
resizeHandler();

// calculate size
function resizeHandler() {
  windowInnerWidth = window.innerWidth;

  if (windowInnerWidth >= desktop) {
    map.setView(new L.LatLng(48.981, 32.839), 6.5);
    timeline.el.noUiSlider.set(selectChangeHandler());
    toolbox.classList.remove("display-none");
    viewLegendButton.classList.add("display-none");
    viewLegendButton.classList.remove("display-block");
  }

  if (windowInnerWidth < desktop) {
    map.setView(new L.LatLng(49.19953923337175, 34.57093513324714), 5.5);
    viewLegendButton.classList.remove("display-none");
    toolbox.classList.add("display-none");
  }
}
