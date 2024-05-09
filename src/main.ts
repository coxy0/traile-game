import * as THREE from "three";
import ThreeGlobe from "three-globe";
import { OrbitControls } from "three/examples/jsm/Addons.js";

// import { polygonCentroid } from "./utils/centroid";
import { islandCountries } from "./utils/island";
import { getRandomCountries } from "./utils/randomCountries";

fetch("src/assets/data/ne_110m_admin_0_countries.geojson")
  .then((res) => res.json())
  .then((countries) => {
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
    countries = countries.features;
    const earth = new ThreeGlobe({ waitForGlobeReady: true, animateIn: true })
      .globeImageUrl(globeImage)
      .onGlobeReady(() => {
        const globeContainer = document.getElementById("globe-container");
        const loadingText = document.getElementById("loading-text");
        globeContainer?.removeChild(loadingText!);

        console.log(`Loaded texture: ${globeImage}`);
      })
      .polygonsData(countries)
      .polygonCapColor(() => "rgba(200, 0, 0, 0.8)")
      .polygonSideColor(() => "rgba(0, 0, 0, 1)")
      .polygonStrokeColor(() => "#111")
      .polygonsTransitionDuration(1500);
    scene.add(earth);
    let rotateEarth = true;

    const countriesISO: string[] = [];
    const refreshCountries = (countryISO: string | null) => {
      if (countryISO) countriesISO.push(countryISO);
      const filteredCountries = countries.filter(
        (data: { properties: { ISO_A3: string } }) =>
          countriesISO.includes(data.properties.ISO_A3)
      );

      earth.polygonsData(filteredCountries);
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

    (function animate() {
      requestAnimationFrame(animate);

      if (rotateEarth) earth.rotation.y += -0.0004;

      controls.update();
      renderer.render(scene, camera);
    })();

    //

    const countriesData: { name: string; ISO: string }[] = [];
    const mainlandCountries: string[] = [];
    for (const data of countries) {
      const name = data.properties.ADMIN;
      const ISO = data.properties.ISO_A3;

      countriesData.push({
        name: name,
        ISO: ISO,
      });

      if (!islandCountries.includes(name)) mainlandCountries.push(name);
    }
    const countriesDataMap = new Map(
      countriesData.map((country) => [country.name.toLowerCase(), country.ISO])
    );

    //

    const [country1, country2] = getRandomCountries(mainlandCountries);
    refreshCountries(countriesDataMap.get(country1.toLowerCase())!);
    refreshCountries(countriesDataMap.get(country2.toLowerCase())!);

    const country1Span = document.getElementById(
      "country-name-1"
    ) as HTMLSpanElement;
    country1Span.innerHTML = country1;

    const country2Span = document.getElementById(
      "country-name-2"
    ) as HTMLSpanElement;
    country2Span.innerHTML = country2;

    //

    const handleSubmit = () => {
      const inputValue = countryInput.value.toLowerCase();
      if (!inputValue) return;
      console.log(`Entered value: ${inputValue}`);

      const ISOCode = countriesDataMap.get(inputValue);
      if (ISOCode) {
        console.log("Valid country");
        refreshCountries(ISOCode);
      }

      countryInput.value = "";
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
  });
