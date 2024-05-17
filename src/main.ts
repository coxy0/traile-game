import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import ThreeGlobe from "three-globe";

import geographicData from "./assets/data/ne_110m_admin_0_countries.json";
const countries = geographicData.features;

import { randomHexColour } from "./utils/randomHex";
import { islandCountries } from "./utils/island";
import { randomCountries } from "./utils/randomCountries";
// import { polygonCentroid } from "./utils/centroid";
import { dist, closestPoints } from "./utils/closest";

const canvas: HTMLCanvasElement = document.createElement("canvas");
document.getElementById("globe-container")?.appendChild(canvas);
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
const dimension = parseInt(
  getComputedStyle(document.body).getPropertyValue("--canvas-dimension")
);
renderer.setSize(dimension, dimension);

const scene = new THREE.Scene();
scene.add(new THREE.AmbientLight(0xcccccc, Math.PI));
scene.add(new THREE.DirectionalLight(0xffffff, 0.6 * Math.PI));

const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
camera.position.setZ(176);

const globeImage = "src/assets/images/earth.jpg";

const earth = new ThreeGlobe({ waitForGlobeReady: true, animateIn: true })
  .globeImageUrl(globeImage)
  .showAtmosphere(false)
  .onGlobeReady(() => {
    const globeContainer = document.getElementById("globe-container");
    const loadingText = document.getElementById("loading-text");
    globeContainer?.removeChild(loadingText!);

    console.log(`Loaded texture: ${globeImage}`);
  })
  .polygonsData(countries)
  .polygonCapColor(randomHexColour)
  .polygonSideColor(() => "rgba(0, 0, 0, 1)")
  .polygonStrokeColor(() => "#111")
  .polygonsTransitionDuration(1500);
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

const controls = new OrbitControls(camera, renderer.domElement);
controls.addEventListener("start", () => (rotateEarth = false));
controls.addEventListener("end", () => (rotateEarth = true));
controls.enablePan = false;
controls.rotateSpeed = 0.18;
controls.minDistance = 115;
controls.maxDistance = 275;
controls.addEventListener("change", () => {
  const distance = controls.getDistance();
  if (distance <= 176) controls.rotateSpeed = 0.002 * distance - 0.19;
  else controls.rotateSpeed = 0.0004 * distance + 0.11;
});

let rotateEarth = true;
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

let country1, country2;
let cx1, cy1, cx2, cy2, distance;
let continent1, continent2;
do {
  [country1, country2] = randomCountries(mainlandCountries);

  const country1Points = getPoints(country1);
  const country2Points = getPoints(country2);
  [cx1, cy1, cx2, cy2] = closestPoints(country1Points, country2Points);
  distance = dist(cx1, cy1, cx2, cy2);

  continent1 = getContinent(country1);
  continent2 = getContinent(country2);
} while (distance <= 20 || distance >= 25 || continent1 !== continent2);

refreshCountries(country1);
refreshCountries(country2);

const updateCountrySpan = (id: string, country: string) => {
  const countrySpan = document.getElementById(id) as HTMLSpanElement;
  countrySpan.innerHTML = country;
};

updateCountrySpan("country-name-1", country1);
updateCountrySpan("country-name-2", country2);

//

const handleSubmit = () => {
  const inputValue = countryInput.value.toLowerCase();
  if (!inputValue) return;
  countryInput.value = "";
  console.log(`Entered value: ${inputValue}`);

  if (countriesData.includes(inputValue)) refreshCountries(inputValue);
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
