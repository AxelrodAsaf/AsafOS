import { defaultNewsImageFallback } from "../config.js";

export const formatArticleTime = (value) => {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    const match = value.match(/(\d{2}):(\d{2})/);
    return match ? `${match[1]}:${match[2]}` : "";
  }

  return parsed.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
};

export const updateNews = (articles) => {
  const tile = document.getElementById("news-list");
  const tableBody = document.getElementById("news-table-body");
  tile.hidden = false;
  tableBody.innerHTML = "";

  articles.forEach((article) => {
    const imageUrl = article.image || defaultNewsImageFallback;
    const articleTime = formatArticleTime(article.pubDate);
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>
        <a href="${article.link}" target="_blank" rel="noreferrer">${article.title}</a>
        <div class="news-meta">${articleTime}</div>
      </td>
      <td>
        <a href="${article.link}" target="_blank" rel="noreferrer">
          <img src="${imageUrl}" alt="${article.title}">
        </a>
      </td>
    `;

    const image = row.querySelector("img");
    image.addEventListener("error", () => {
      image.src = defaultNewsImageFallback;
    }, { once: true });

    tableBody.appendChild(row);
  });
};
