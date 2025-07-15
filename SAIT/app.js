const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const createScene = async () => {
  const scene = new BABYLON.Scene(engine);

  const camera = new BABYLON.WebXRCamera("webXRCamera", scene);
  camera.position = new BABYLON.Vector3(0, 1.5, -3);

  const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
  light.intensity = 1.2;

  // Load GLB Model
  const model = await BABYLON.SceneLoader.ImportMeshAsync("", "./models/", "yourModel.glb", scene);
  model.meshes.forEach(m => {
    m.scaling = new BABYLON.Vector3(1.5, 1.5, 1.5);
  });

  // Enable XR
  const xr = await scene.createDefaultXRExperienceAsync({
    uiOptions: {
      sessionMode: "immersive-ar",
      referenceSpaceType: "local-floor"
    },
    optionalFeatures: true
  });

  // Hit test and place model on first tap
  const featuresManager = xr.baseExperience.featuresManager;
  const hitTest = featuresManager.enableFeature(BABYLON.WebXRHitTest.Name, "latest");
  let placed = false;

  hitTest.onHitTestResultObservable.add((results) => {
    if (!placed && results.length) {
      const hit = results[0];
      const anchor = hit.createAnchor();
      model.meshes.forEach(mesh => mesh.setParent(anchor));
      placed = true;
    }
  });

  return scene;
};

createScene().then(scene => {
  engine.runRenderLoop(() => scene.render());
});

window.addEventListener("resize", () => engine.resize());

document.getElementById("enterAR").addEventListener("click", async () => {
  const xr = await engine.scenes[0].createDefaultXRExperienceAsync({
    uiOptions: {
      sessionMode: "immersive-ar",
      referenceSpaceType: "local-floor"
    }
  });
});
