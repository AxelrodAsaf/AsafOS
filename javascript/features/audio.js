export const initializeAudioPlayer = () => {
  const playPauseButton = document.getElementById("galgalatz-toggle-button");
  const playIcon = document.getElementById("glglz-play-icon");
  const pauseIcon = document.getElementById("glglz-pause-icon");
  const audioPlayer = document.getElementById("audio-player");

  playPauseButton.addEventListener("click", async () => {
    if (audioPlayer.paused) {
      try {
        await audioPlayer.play();
        playIcon.style.display = "none";
        pauseIcon.style.display = "block";
      } catch (error) {
        console.error("Failed to play audio:", error);
      }
      return;
    }

    audioPlayer.pause();
    playIcon.style.display = "block";
    pauseIcon.style.display = "none";
  });
};
