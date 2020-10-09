/*
 *  Tarea 2
 *  Solar system
 * 
 *  Daniel Roa
 *  A01021960
 */

// Variable initializer
let renderer = null,
    scene = null,
    camera = null,
    sol = null,
    sSystem = null,                 //  Where we'll hold the information regarding the objects to render
    planetTexture = ["../img/", "", "", "", "", "", "", "", ""],
    cosmoText = null,
    cosmoMat = null,
    moonTexture = "../img/moon.jpg",
    sunTexture = "../img/sun_text.jpg",                        
    cosmos,                         //  Array to hold all 8 planets and a planetoid
    orbitasCosmos = [],              //  Array to hold the orbits of the created planets
    asteroidBelt = [],              //  Array to create the asteroid belt
    mooAmount = [0, 0, 1, 2, 15, 15, 15, 14],
    planetCont = 0,
    sunPivot,
    pause = false,
    planetFeatures;

let galaxyB = "../img/Galaxy.jpg"

let planetTextures = [  
    "../img/mercuryText.jpg",
    "../img/venusText.jpg",
    "../img/earthText.jpg",
    "../img/marsText.jpg",
    "../img/jupiterText.jpg",
    "../img/saturnText.jpg",
    "../img/uranusText.jpg",
    "../img/neptuneText.jpg",
    "../img/plutoText.jpg"
                    ];


let duration = 5000; // ms
let currentTime = Date.now();

// Data not used to create the planets in the solar system
// The radii were obtained from well known sources such as NASA, it was just calculated by me
// the position array is phoney
let planetRadius = [0.035, 0.087, 0.092, 0.095, 0.124, 0.213, 0.054, 0.043],
cosmoPosition = [10, 20, 30, 40, 70, 85, 95, 105];

// Función donde se van a animar las rotaciones de los planetas
function animate() {
    let now = Date.now();
    let deltat = now - currentTime;
    currentTime = now;
    let fract = deltat / duration;
    let angle = Math.PI * 2 * fract;

    sol.rotation.y += angle;
}

function run() {
    requestAnimationFrame(function () { run(); });

    // Render the scene
    renderer.render(scene, camera);

    // Spin the cube for next frame
    animate();
    
}

// Function used to creat the canvas and it's contents
function createScene(canvas) {
    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    // Set the viewport size
    renderer.setSize(canvas.width, canvas.height);

    var sunFeatures = new THREE.SphereGeometry(10, 100, 100),
    sunImg = new THREE.TextureLoader().load(sunTexture),
    sunMat = new THREE.MeshBasicMaterial({ map: sunImg });

    // Create a new Three.js scene
    scene = new THREE.Scene();

    // Set the background color 
    scene.background = new THREE.TextureLoader().load(galaxyB);
    // scene.background = new THREE.Color( "rgb(100, 100, 100)" );

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 1, 4000);
    camera.position.z = 150;
    scene.add(camera);

    // Create a group to hold all the objects
    sSystem = new THREE.Object3D;

    // Add a directional lux to show off the objects
    var lux = new THREE.PointLight(0xffffff, 1.0);

    // Position the lux out from the scene, pointing at the origin
    lux.position.set(0, 0, 0);
    //scene.add(lux);

    sol = new THREE.Mesh(sunFeatures, sunMat);
    sol.add(lux);
    sSystem.add(sol);


    // For loop to create planets 
   /*  for(var cont = 0; cont<9; cont++){
        cosmoText = new THREE.TextureLoader().load(planetTexture[cont]);
        cosmoMat = new THREE.MeshLambertMaterial({map: cosmoText});
        planetFeatures = new THREE.SphereGeometry(planetRadius[cont], 100, 100);
        orbitasCosmos[cont] = new THREE.Mesh(planetFeatures, cosmoMat);
        orbitasCosmos[cont].position.set(0,0, cosmoPosition[cont]);
        sSystem.add(orbitasCosmos[cont]);
    } */

    cosmos = new THREE.Object3D;
    sSystem.add(cosmos);

    cosmos.position.set(0, 0, cosmoPosition[2]);

    // add mouse handling so we can rotate the scene
    addMouseHandler(canvas, sSystem);

    console.log(sol);
    
    // Now add the group to our scene
    scene.add(sSystem);
}