export const initializeCarousel = () => {
  const carousel = document.querySelector(".carousel");
  const galleryTile = document.querySelector(".gallery-tile");

  if (!carousel || !galleryTile) {
    return;
  }

  const slides = [...carousel.querySelectorAll(".img-container")];
  let activeIndex = 0;
  let paused = false;

  carousel.querySelectorAll("img").forEach((image) => {
    image.draggable = false;
  });

  galleryTile.addEventListener("mouseenter", () => {
    paused = true;
  });

  galleryTile.addEventListener("mouseleave", () => {
    paused = false;
  });

  setInterval(() => {
    if (paused) {
      return;
    }

    activeIndex = (activeIndex + 1) % slides.length;
    carousel.scrollTo({
      left: slides[activeIndex].offsetLeft,
      behavior: "smooth"
    });
  }, 3500);
};
