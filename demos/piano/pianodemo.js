async function playC4() { window.c4 = await window.audioAPI.startNote('defaultTrack', window.noteValues.C4); }
async function playDb4() { window.d4b = await window.audioAPI.startNote('defaultTrack', window.noteValues.D4b); }
async function playD4() { window.d4 = await window.audioAPI.startNote('defaultTrack', window.noteValues.D4); }
async function playEb4() { window.e4b = await window.audioAPI.startNote('defaultTrack', window.noteValues.E4b); }
async function playE4() { window.e4 = await window.audioAPI.startNote('defaultTrack', window.noteValues.E4); }
async function playF4() { window.f4 = await window.audioAPI.startNote('defaultTrack', window.noteValues.F4); }
async function playGb4() { window.g4b = await window.audioAPI.startNote('defaultTrack', window.noteValues.G4b); }
async function playG4() { window.g4 = await window.audioAPI.startNote('defaultTrack', window.noteValues.G4); }
async function playAb4() { window.a4b = await window.audioAPI.startNote('defaultTrack', window.noteValues.A4b); }
async function playA4() { window.a4 = await window.audioAPI.startNote('defaultTrack', window.noteValues.A4); }
async function playBb4() { window.b4b = await window.audioAPI.startNote('defaultTrack', window.noteValues.B4b); }
async function playB4() { window.b4 = await window.audioAPI.startNote('defaultTrack', window.noteValues.B4); }
async function playC5() { window.c5 = await window.audioAPI.startNote('defaultTrack', window.noteValues.C5); }

function releaseC4() { if (window.c4) { window.audioAPI.stopNote('defaultTrack', window.c4); delete window.c4; } }
function releaseDb4() { if (window.d4b) { window.audioAPI.stopNote('defaultTrack', window.d4b); delete window.d4b; } }
function releaseD4() { if (window.d4) { window.audioAPI.stopNote('defaultTrack', window.d4); delete window.d4; } }
function releaseEb4() { if (window.e4b) { window.audioAPI.stopNote('defaultTrack', window.e4b); delete window.e4b; } }
function releaseE4() { if (window.e4) { window.audioAPI.stopNote('defaultTrack', window.e4); delete window.e4; } }
function releaseF4() { if (window.f4) { window.audioAPI.stopNote('defaultTrack', window.f4); delete window.f4; } }
function releaseGb4() { if (window.g4b) { window.audioAPI.stopNote('defaultTrack', window.g4b); delete window.g4b; } }
function releaseG4() { if (window.g4) { window.audioAPI.stopNote('defaultTrack', window.g4); delete window.g4; } }
function releaseAb4() { if (window.a4b) { window.audioAPI.stopNote('defaultTrack', window.a4b); delete window.a4b; } }
function releaseA4() { if (window.a4) { window.audioAPI.stopNote('defaultTrack', window.a4); delete window.a4; } }
function releaseBb4() { if (window.b4b) { window.audioAPI.stopNote('defaultTrack', window.b4b); delete window.b4b; } }
function releaseB4() { if (window.b4) { window.audioAPI.stopNote('defaultTrack', window.b4); delete window.b4; } }
function releaseC5() { if (window.c5) { window.audioAPI.stopNote('defaultTrack', window.c5); delete window.c5; } }

async function pressNote(event) {
   if (!event.repeat) {
      if (event.keyCode === 65) await playC4();
      if (event.keyCode === 87) await playDb4();
      if (event.keyCode === 83) await playD4();
      if (event.keyCode === 69) await playEb4();
      if (event.keyCode === 68) await playE4();
      if (event.keyCode === 70) await playF4();
      if (event.keyCode === 84) await playGb4();
      if (event.keyCode === 71) await playG4();
      if (event.keyCode === 89) await playAb4();
      if (event.keyCode === 72) await playA4();
      if (event.keyCode === 85) await playBb4();
      if (event.keyCode === 74) await playB4();
      if (event.keyCode === 75) await playC5();
   }
}

function releaseNote(event) {
   if (event.keyCode === 65) releaseC4();
   if (event.keyCode === 87) releaseDb4();
   if (event.keyCode === 83) releaseD4();
   if (event.keyCode === 69) releaseEb4();
   if (event.keyCode === 68) releaseE4();
   if (event.keyCode === 70) releaseF4();
   if (event.keyCode === 84) releaseGb4();
   if (event.keyCode === 71) releaseG4();
   if (event.keyCode === 89) releaseAb4();
   if (event.keyCode === 72) releaseA4();
   if (event.keyCode === 85) releaseBb4();
   if (event.keyCode === 74) releaseB4();
   if (event.keyCode === 75) releaseC5();
}

async function changeInstrument() {
   const instrumentSelector = document.getElementById('instrument');
   const instrumentSelection = instrumentSelector.options[instrumentSelector.selectedIndex].value;
   if (instrumentSelector.selectedIndex > 0) {
      document.getElementById("status").textContent = 'Loading...';
      window.audioAPI.start();
      await window.audioAPI.updateInstrument('defaultTrack', instrumentSelection);
      document.getElementById("piano").classList.remove("disabled");
      document.getElementById("status").textContent = 'Ready';
      console.log('Instrument loading complete!');
   }
}

window.addEventListener('keydown', e => { (async() => { await pressNote(e); })(); });
window.addEventListener('keyup', releaseNote);

window.onload = () => {
   window.audioAPI = new WebAudioAPI();
   window.audioAPI.createTrack('defaultTrack');
   window.noteValues = window.audioAPI.getAvailableNotes();
   const instrumentSelector = document.getElementById('instrument');
   instrumentSelector.add(new Option('Choose an instrument'));
   window.audioAPI.getAvailableInstruments('../instruments').then(instruments => instruments.forEach(instrument => instrumentSelector.add(new Option(instrument))));
};
