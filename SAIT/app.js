const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const createScene = async () => {
  const scene = new BABYLON.Scene(engine);

  // Light
  const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
  light.intensity = 1.2;

  // Load Model (adjust name/path)
  const result = await BABYLON.SceneLoader.ImportMeshAsync("", "./models/", "yourModel.glb", scene);
  const rootMesh = result.meshes[0];
  rootMesh.setEnabled(false); // Hide until placed

  // Enable XR
  const xrHelper = await scene.createDefaultXRExperienceAsync({
    uiOptions: {
      sessionMode: "immersive-ar",
      referenceSpaceType: "local-floor"
    }
  });

  const fm = xrHelper.baseExperience.featuresManager;
  const hitTest = fm.enableFeature(BABYLON.WebXRHitTest.Name, "latest");

  let placed = false;

  hitTest.onHitTestResultObservable.add((results) => {
    if (!placed && results.length) {
      const hit = results[0];
      const anchor = hit.createAnchor();
      rootMesh.setEnabled(true);
      rootMesh.setParent(anchor);
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
  // Trigger AR session start
  await engine.scenes[0].createDefaultXRExperienceAsync({
    uiOptions: {
      sessionMode: "immersive-ar",
      referenceSpaceType: "local-floor"
    }
  });
});
