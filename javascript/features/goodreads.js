const defaultGoodreadsProfileUrl =
  "https://www.goodreads.com/user/show/200705407-asaf-axelrod";

export const updateGoodreadsCurrentBook = (book) => {
  const tile = document.getElementById("goodreads-current-tile");

  if (!tile) {
    return;
  }

  if (!book || !book.title || !book.imageUrl) {
    tile.hidden = true;
    return;
  }

  tile.hidden = false;
  const bookLink = book.link || defaultGoodreadsProfileUrl;
  document.getElementById("goodreads-current-cover-link").href = bookLink;
  document.getElementById("goodreads-current-title-link").href = bookLink;
  document.getElementById("goodreads-current-cover").src = book.imageUrl;
  document.getElementById("goodreads-current-title").textContent = book.title;
  document.getElementById("goodreads-current-author").textContent = book.author;
};

const renderRatingStars = (rating) => {
  const fullStars = "★".repeat(Math.max(0, Math.min(5, rating)));
  const emptyStars = "☆".repeat(Math.max(0, 5 - rating));
  return `${fullStars}${emptyStars}`;
};

export const updateGoodreadsRatedBooks = (books) => {
  const tile = document.getElementById("goodreads-ratings-tile");
  const tableBody = document.querySelector("#goodreads-ratings-table tbody");

  if (!tile || !tableBody) {
    return;
  }

  const validBooks = (books ?? []).filter(
    (book) => book?.title && book?.imageUrl && book?.author
  );

  if (validBooks.length === 0) {
    tile.hidden = true;
    tableBody.innerHTML = "";
    return;
  }

  tile.hidden = false;
  tableBody.innerHTML = "";

  validBooks.forEach((book) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>
        <a href="${book.link}" target="_blank" rel="noreferrer">
          <img src="${book.imageUrl}" alt="${book.title}">
        </a>
      </td>
      <td>
        <a href="${book.link}" target="_blank" rel="noreferrer" class="goodreads-book-title">${book.title}</a>
        <div class="goodreads-book-author">${book.author}</div>
        <div class="goodreads-book-rating">${renderRatingStars(book.rating)}</div>
      </td>
    `;
    tableBody.appendChild(row);
  });
};
