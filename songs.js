const ALL_SONGS = [
  "Chill in the Blue",
  "Cold Colors and Nature's Call",
  "One Last Dance",
  "Whiskey Tears",
  "Einsamkeit und Zweifel",
];

const currentSongs = [...ALL_SONGS];

/**
 * @type {HTMLAudioElement}
 */
let audio;

function play() {
  if (!currentSongs.length) {
    currentSongs.push(...ALL_SONGS);
  }
  const [randomSong] = currentSongs.splice(
    Math.floor(Math.random() * currentSongs.length),
    1
  );
  document
    .querySelector("#music-namer")
    .querySelector("a").innerText = `${randomSong}`;
  audio = new Audio(`./assets/songs/${randomSong}.mp3`);
  audio.volume = 0.3;
  audio.play();
  audio.onended = () => {
    setTimeout(play, 1000);
  };
}

document.querySelector("#play-button").addEventListener("click", (e) => {
  e.preventDefault();
  document
    .querySelector("#music-namer")
    .querySelector("small")
    .classList.toggle("d-none");
  if (audio) {
    audio.pause();
    audio = null;
  } else {
    play();
  }
});
