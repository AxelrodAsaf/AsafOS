let isHoveringNewsTile = false;

export function scrollNews() {
  const container = document.getElementById('news-scroll-container');
  const table = document.getElementById('news-table-body');
  let speed = 0.25;

  function startScrolling() {
    let scrollAmount = 0;

    const scroll = () => {
      if (!isHoveringNewsTile) {
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

  document.getElementById('news-list').addEventListener('mouseover', () => {
    isHoveringNewsTile = true;
    speed = 0;
  });

  document.getElementById('news-list').addEventListener('mouseout', () => {
    isHoveringNewsTile = false;
    speed = 0.25;
  });

  startScrolling();
}
scrollNews();
