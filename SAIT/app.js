const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const createScene = async () => {
  const scene = new BABYLON.Scene(engine);

  // Add light
  const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
  light.intensity = 1.2;

  // Load the model
  const result = await BABYLON.SceneLoader.ImportMeshAsync("", "./models/", "yourModel.glb", scene);
  const rootMesh = result.meshes[0];

  // Hide the model initially until it's placed
  rootMesh.setEnabled(false);

  // Prepare XR
  const xr = await scene.createDefaultXRExperienceAsync({
    uiOptions: {
      sessionMode: "immersive-ar",
      referenceSpaceType: "local-floor"
    },
    optionalFeatures: true
  });

  const featuresManager = xr.baseExperience.featuresManager;

  // Enable hit test for model placement
  const hitTest = featuresManager.enableFeature(BABYLON.WebXRHitTest.Name, "latest");
  let modelPlaced = false;

  hitTest.onHitTestResultObservable.add((results) => {
    if (!modelPlaced && results.length > 0) {
      const hit = results[0];
      const anchor = hit.createAnchor();
      rootMesh.setEnabled(true);
      rootMesh.setParent(anchor);
      modelPlaced = true;
    }
  });

  return scene;
};

createScene().then((scene) => {
  engine.runRenderLoop(() => scene.render());
});

window.addEventListener("resize", () => engine.resize());

document.getElementById("enterAR").addEventListener("click", async () => {
  const xrHelper = await engine.scenes[0].createDefaultXRExperienceAsync({
    uiOptions: {
      sessionMode: "immersive-ar",
      referenceSpaceType: "local-floor"
    }
  });
});
