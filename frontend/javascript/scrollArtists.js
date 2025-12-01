let isHoveringArtists = false;

export function scrollArtists() {
  const container = document.getElementById('spotify-artists-container');
  const table = document.getElementById('spotify-artists-table');
  let speed = 0.5;

  function startScrolling() {
    let scrollAmount = 0;

    const scroll = () => {
      if (!isHoveringArtists) {
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

  document.getElementById('spotify-artists-tile').addEventListener('mouseover', () => {
    isHoveringArtists = true;
    speed = 0;
  });

  document.getElementById('spotify-artists-tile').addEventListener('mouseout', () => {
    isHoveringArtists = false;
    speed = 1;
  });

  startScrolling();
}
scrollArtists();
