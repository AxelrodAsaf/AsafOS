export function imageCarousel() {
  const carousel = document.querySelector('.carousel');
  const images = carousel.querySelectorAll('.img-container');
  let currentImageIndex = 0;

  function scrollToImage(index) {
    const offsetLeft = images[index].offsetLeft;
    carousel.scrollTo({
      left: offsetLeft,
      behavior: 'smooth'
    });
  }

  function nextImage() {
    currentImageIndex = (currentImageIndex + 1) % images.length;
    scrollToImage(currentImageIndex);
  }

  setInterval(nextImage, 3000);
};

imageCarousel();
