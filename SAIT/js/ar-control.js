let currentMarker = null;

AFRAME.registerComponent('markerhandler', {
  init: function () {
    const marker = this.el;
    marker.addEventListener('markerFound', () => {
      currentMarker = marker.id;
      console.log(`${marker.id} found`);
      const sound = document.querySelector(`#${getSoundId(marker.id)}`);
      if (sound) sound.components.sound.playSound();
    });

    marker.addEventListener('markerLost', () => {
      console.log(`${marker.id} lost`);
      if (currentMarker === marker.id) currentMarker = null;
    });
  }
});

function getModelId(markerId) {
  return `model${markerId.replace("marker", "")}`;
}

function getSoundId(markerId) {
  return `sound${markerId.replace("marker", "")}`;
}

function playMedia() {
  if (!currentMarker) return;
  const model = document.querySelector(`#${getModelId(currentMarker)}`);
  const sound = document.querySelector(`#${getSoundId(currentMarker)}`);
  model.setAttribute('animation-mixer', 'timeScale', 1);
  sound.components.sound.playSound();
}

function pauseMedia() {
  if (!currentMarker) return;
  const model = document.querySelector(`#${getModelId(currentMarker)}`);
  const sound = document.querySelector(`#${getSoundId(currentMarker)}`);
  model.setAttribute('animation-mixer', 'timeScale', 0);
  sound.components.sound.pauseSound();
}

function replayMedia() {
  if (!currentMarker) return;
  const model = document.querySelector(`#${getModelId(currentMarker)}`);
  const sound = document.querySelector(`#${getSoundId(currentMarker)}`);
  model.removeAttribute('animation-mixer');
  model.setAttribute('animation-mixer', '');
  sound.components.sound.stopSound();
  sound.components.sound.playSound();
}

// Attach handlers to each marker
window.addEventListener('load', () => {
  document.querySelectorAll('a-marker').forEach(marker => {
    marker.setAttribute('markerhandler', '');
  });
});
