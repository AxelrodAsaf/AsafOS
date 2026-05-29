export const updateResumeTile = (resumePdfUrl) => {
  if (!resumePdfUrl) {
    return;
  }

  const grid = document.getElementById("grid");
  const insertionAnchor = document.getElementById("employment");
  const existingTile = document.getElementById("resume-tile");

  if (existingTile) {
    const downloadLink = existingTile.querySelector(".resume-download-link");

    if (downloadLink) {
      downloadLink.href = resumePdfUrl;
    }

    const frame = existingTile.querySelector(".resume-preview-frame");

    if (frame) {
      frame.src = `${resumePdfUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`;
    }

    return;
  }

  const resumeTile = document.createElement("div");
  resumeTile.id = "resume-tile";
  resumeTile.className = "tile long-tile";
  resumeTile.innerHTML = `
    <div class="resume-header">
      <h3 class="resume-header-text">Resume</h3>
    </div>
    <div class="resume-preview-shell">
      <iframe
        class="resume-preview-frame"
        src="${resumePdfUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH"
        title="Resume preview"
        loading="lazy"
      ></iframe>
      <a
        class="resume-download-overlay resume-download-link tile-link-focus"
        href="${resumePdfUrl}"
        target="_blank"
        rel="noreferrer"
        aria-label="Download resume"
      >
        <i class="fa-solid fa-file-arrow-down"></i>
      </a>
    </div>
  `;

  if (insertionAnchor) {
    insertionAnchor.insertAdjacentElement("afterend", resumeTile);
    return;
  }

  grid.appendChild(resumeTile);
};
