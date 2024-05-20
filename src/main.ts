import geographicData from "./assets/data/ne_110m_admin_0_countries.json";
const countries = geographicData.features;

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import ThreeGlobe from "three-globe";
import globeImage from "./assets/images/earth.jpg";
import globeBumpImage from "./assets/images/earth-topography.jpg";

import { randomHexColour } from "./utils/randomHex";
import { attachCheckboxFuncs } from "./utils/checkbox";
import { islandCountries } from "./utils/island";
import { randomCountries } from "./utils/randomCountries";
import { dist, closestPoints } from "./utils/closest";
// import { polygonCentroid } from "./utils/centroid";

const canvas: HTMLCanvasElement = document.createElement("canvas");
document.getElementById("globe-container")?.appendChild(canvas);
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
const styles = getComputedStyle(document.body);
const dimension = parseInt(styles.getPropertyValue("--canvas-dimension"));
renderer.setSize(dimension, dimension);

const scene = new THREE.Scene();
scene.add(new THREE.AmbientLight(0xcccccc, Math.PI));
scene.add(new THREE.DirectionalLight(0xffffff, 0.6 * Math.PI));

const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
camera.position.setZ(176);

const colourMap = new Map();
for (const country of countries)
  colourMap.set(country.properties.ADMIN.toLowerCase(), randomHexColour());
const getPolygonCapColor = (feature: {
  properties: { ADMIN: string };
}): string => colourMap.get(feature.properties.ADMIN.toLowerCase());

const earth = new ThreeGlobe({ waitForGlobeReady: true, animateIn: true })
  .globeImageUrl(globeImage)
  .bumpImageUrl(globeBumpImage)
  .showAtmosphere(false)
  .onGlobeReady(() => {
    const globeContainer = document.getElementById("globe-container");
    const loadingText = document.getElementById("loading-text");
    globeContainer?.removeChild(loadingText!);

    console.log(`Loaded texture: ${globeImage}`);
    console.log(`Loaded texture: ${globeBumpImage}`);
  })
  .polygonsData(countries)
  // .polygonCapColor(randomHexColour)
  .polygonCapColor(getPolygonCapColor as (obj: object) => string)
  .polygonSideColor(() => "rgba(0, 0, 0, 1)")
  .polygonStrokeColor(() => "#111")
  .polygonsTransitionDuration(1750);
scene.add(earth);

const highlightedCountries: string[] = [];
const refreshCountries = (countryName: string | null) => {
  if (countryName) highlightedCountries.push(countryName.toLowerCase());

  const filtered = countries.filter(
    (data: { properties: { ADMIN: string } }) => {
      const name = data.properties.ADMIN.toLowerCase();
      return highlightedCountries.includes(name);
    }
  );
  earth.polygonsData(filtered);
};
refreshCountries(null);

let rotateEarth = false;
let rotateEarthChecked = false;
attachCheckboxFuncs(
  "rotate-earth",
  () => (rotateEarth = rotateEarthChecked = true),
  () => (rotateEarth = rotateEarthChecked = false)
);

const controls = new OrbitControls(camera, renderer.domElement);
controls.addEventListener("start", () => {
  if (rotateEarthChecked) rotateEarth = false;
});
controls.addEventListener("end", () => {
  if (rotateEarthChecked) rotateEarth = true;
});
controls.enablePan = false;
controls.rotateSpeed = 0.18;
controls.minDistance = 115;
controls.maxDistance = 275;
controls.addEventListener("change", () => {
  const distance = controls.getDistance();
  if (distance <= 176) controls.rotateSpeed = 0.002 * distance - 0.19;
  else controls.rotateSpeed = 0.0004 * distance + 0.11;
});

(function animate() {
  requestAnimationFrame(animate);

  if (rotateEarth) earth.rotation.y += -0.0004;

  controls.update();
  renderer.render(scene, camera);
})();

//

const countriesData: string[] = [];
const mainlandCountries: string[] = [];
for (const data of countries) {
  const name = data.properties.ADMIN;
  const nameLower = name.toLowerCase();
  countriesData.push(nameLower);
  if (!islandCountries.includes(name)) mainlandCountries.push(nameLower);
}

//

const getPoints = (country: string): number[][] => {
  for (const data of countries) {
    const name = data.properties.ADMIN.toLowerCase();
    if (country.toLowerCase() === name) {
      const type = data.geometry.type;
      const coordinates = data.geometry.coordinates;

      if (type === "Polygon") return coordinates[0] as number[][];

      let allCoordinates: number[][] = [];
      if (type === "MultiPolygon")
        for (const polygon of coordinates)
          for (const ring of polygon)
            allCoordinates = allCoordinates.concat(ring);
      return allCoordinates;
    }
  }
  return [];
};

const getContinent = (country: string): string | undefined => {
  for (const data of countries) {
    const name = data.properties.ADMIN.toLowerCase();
    if (country === name) return data.properties.CONTINENT;
  }
  return;
};

let country1, country2, country1Points, country2Points;
let cx1, cy1, cx2, cy2, distance;
let continent1, continent2;
do {
  [country1, country2] = randomCountries(mainlandCountries);

  country1Points = getPoints(country1);
  country2Points = getPoints(country2);
  [cx1, cy1, cx2, cy2] = closestPoints(country1Points, country2Points);
  distance = dist(cx1, cy1, cx2, cy2);

  continent1 = getContinent(country1);
  continent2 = getContinent(country2);
} while (distance <= 20 || distance >= 24 || continent1 !== continent2);

refreshCountries(country1);
refreshCountries(country2);

const updateCountrySpan = (id: string, country: string) => {
  const countrySpan = document.getElementById(id) as HTMLSpanElement;
  countrySpan.innerHTML = country;
  const countryColour = colourMap.get(country);
  countrySpan.style.setProperty("color", countryColour);
};

updateCountrySpan("country-name-1", country1);
updateCountrySpan("country-name-2", country2);

//

const createPastGuess = (country: string) => {
  const wrapper = document.getElementById("past-guesses-wrapper");

  const pastGuessDiv = document.createElement("div");
  pastGuessDiv.className = "past-guess";

  const countrySpan = document.createElement("span");
  countrySpan.className = "past-guess-country";
  countrySpan.textContent = country;

  const ratingDiv = document.createElement("div");
  ratingDiv.className = "past-guess-rating";

  pastGuessDiv.appendChild(countrySpan);
  pastGuessDiv.appendChild(ratingDiv);

  wrapper?.appendChild(pastGuessDiv);
};

//

const successfulSubmit = (inputValue: string) => {
  refreshCountries(inputValue);
  createPastGuess(inputValue);
};

const handleSubmit = () => {
  const inputValue = countryInput.value.toLowerCase();
  if (!inputValue) return;
  countryInput.value = "";
  console.log(`Entered value: ${inputValue}`);

  if (countriesData.includes(inputValue)) successfulSubmit(inputValue);
};

const countryInput = document.getElementById(
  "country-input"
) as HTMLInputElement;
countryInput.addEventListener("keydown", (event: KeyboardEvent) => {
  if (event.key === "Enter") handleSubmit();
});

const countryInputButton = document.getElementById(
  "country-submit"
) as HTMLButtonElement;
countryInputButton.addEventListener("click", (event: MouseEvent) => {
  if (event.button === 0) handleSubmit();
});

//
