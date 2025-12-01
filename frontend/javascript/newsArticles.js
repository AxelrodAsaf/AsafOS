// Function to fetch RSS feed and update existing JSON file
export async function updateNewsArticles() {
  try {
    // URL of the RSS feed
    // const url = 'https://rcs.mako.co.il/rss/news-israel.xml';
    const url = 'https://rcs.mako.co.il/rss/31750a2610f26110VgnVCM1000005201000aRCRD.xml';
    // const url = 'https://www.king5.com/feeds/syndication/rss/news/local';

    // Fetch the RSS feed
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch RSS feed.');
    };

    const data = await response.text();

    // Parse XML response
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(data, 'text/xml');

    // Extract items from the XML
    const items = xmlDoc.querySelectorAll('item');
    const newArticles = Array.from(items).map(item => ({
      title: item.querySelector('title').textContent,
      description: item.querySelector('description').textContent,
      link: item.querySelector('link').textContent,
      pubDate: item.querySelector('pubDate').textContent,
      shortDescription: item.querySelector('shortDescription')?.textContent || '',
      image: item.querySelector('image')?.textContent || ''
    }));

    // Add the article data in a table element with tooltip for description
    const newsTableBody = document.getElementById('news-table-body');
    newArticles.forEach(article => {
      // Create a new row
      const row = newsTableBody.insertRow();

      // Create the link element
      const link = document.createElement('a');
      link.href = article.link; // Set the href attribute to the article link
      link.target = '_blank'; // Open link in a new tab

      // Create the image cell
      const imageCell = row.insertCell();
      const articleImage = document.createElement('img');
      articleImage.src = article.image;
      articleImage.alt = `${article.title} Image`;
      imageCell.appendChild(articleImage);

      // Create the title cell
      const titleCell = row.insertCell();
      const titleText = document.createTextNode(article.title);
      titleCell.appendChild(titleText);

      // Append the link element containing the image and title cells to the row
      link.appendChild(titleCell);
      link.appendChild(imageCell);
      row.appendChild(link);

      // Add hover tooltip for description (using title attribute)
      link.title = article.shortDescription;

      // Optionally, you can add additional cells for other data like short description or source
      // For example:
      // const shortDescriptionCell = row.insertCell();
      // shortDescriptionCell.textContent = article.shortDescription;

      // const sourceCell = row.insertCell();
      // sourceCell.textContent = article.src;
    });


  } catch (error) {
    console.error(error);
  }
}

// Call the function to fetch RSS feed and update JSON file
updateNewsArticles();
