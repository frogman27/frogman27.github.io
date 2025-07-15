const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);
let currentAnim = null;
let currentAudio = null;

const createScene = async () => {
  const scene = new BABYLON.Scene(engine);
  const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

const xrHelper = await scene.createDefaultXRExperienceAsync({
  uiOptions: { sessionMode: "immersive-ar", referenceSpaceType: "local-floor" },
  optionalFeatures: true
});

document.getElementById("enterAR").addEventListener("click", async () => {
  try {
    await xrHelper.baseExperience.enterXRAsync(
      "immersive-ar",
      "local-floor",
      { optionalFeatures: ["hit-test", "anchors"] }
    );
  } catch (e) {
    console.error("Failed to enter AR:", e);
  }
});


  const featuresManager = xrHelper.baseExperience.featuresManager;
  const hitTest = featuresManager.enableFeature(BABYLON.WebXRHitTest.Name, "latest");

  const loadModelWithAudio = async (modelFile, audioFile) => {
    const result = await BABYLON.SceneLoader.ImportMeshAsync("", "models/", modelFile, scene);
    const root = result.meshes[0];
    root.setEnabled(false);
    const animGroup = result.animationGroups[0];
    const sound = new BABYLON.Sound("audio", "audio/" + audioFile, scene, null, {
      loop: false,
      autoplay: false
    });

    return { root, animGroup, sound, placed: false };
  };

  const model1 = await loadModelWithAudio("marker1.glb", "marker1.mp3");
  const model2 = await loadModelWithAudio("marker2.glb", "marker2.mp3");

  hitTest.onHitTestResultObservable.add((results) => {
    if (results.length) {
      const hit = results[0];
      const anchor = hit.createAnchor();

      if (!model1.placed) {
        model1.root.setEnabled(true);
        model1.root.setParent(anchor);
        model1.animGroup.start(true);
        model1.sound.play();
        currentAnim = model1.animGroup;
        currentAudio = model1.sound;
        model1.placed = true;
      } else if (!model2.placed) {
        model2.root.setEnabled(true);
        model2.root.setParent(anchor);
        model2.animGroup.start(true);
        model2.sound.play();
        currentAnim = model2.animGroup;
        currentAudio = model2.sound;
        model2.placed = true;
      }
    }
  });

  return scene;
};

window.play = () => {
  if (currentAnim && !currentAnim.isPlaying) currentAnim.play(true);
  if (currentAudio && !currentAudio.isPlaying) currentAudio.play();
};

window.pause = () => {
  if (currentAnim) currentAnim.pause();
  if (currentAudio) currentAudio.pause();
};

window.replay = () => {
  if (currentAnim) {
    currentAnim.reset();
    currentAnim.play(true);
  }
  if (currentAudio) {
    currentAudio.stop();
    currentAudio.play();
  }
};

createScene().then(scene => {
  engine.runRenderLoop(() => scene.render());
});
window.addEventListener("resize", () => engine.resize());
