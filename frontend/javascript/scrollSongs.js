let isHoveringSongs = false;

export function scrollSongs() {
  const container = document.querySelector('.scroll-container');
  const table = document.querySelector('#spotify-songs-table');
  const speed = .5;

  function startScrolling() {
    let scrollAmount = 0;

    const scroll = () => {
      if (!isHoveringSongs) {
        scrollAmount += speed;
        if (scrollAmount >= table.offsetHeight / 2) {
          scrollAmount = 0;
        }
        container.scrollTop = scrollAmount;
      }
      requestAnimationFrame(scroll);
    };

    scroll();
  }

  startScrolling();
}

document.getElementById('spotify-songs-list').addEventListener('mouseover', () => {
  isHoveringSongs = true;
});
document.getElementById('spotify-songs-list').addEventListener('mouseout', () => {
  isHoveringSongs = false;
});
scrollSongs();
