export function fetchGitHubInfo(username) {
  const apiUrl = `https://api.github.com/users/${username}`;

  fetch(apiUrl)
    .then(response => {
      return response.json();
    })
    .then(data => {
      // Ensure the elements exist before trying to access them
      const usernameElement = document.getElementById('github-username');
      const followersElement = document.getElementById('github-followers');
      const followingElement = document.getElementById('github-following');
      const reposElement = document.getElementById('github-repos');
      const githubTile = document.getElementById('github-tile');

      if (usernameElement) usernameElement.textContent = data.login;
      if (followersElement) followersElement.textContent = "Followers: " + data.followers;
      if (followingElement) followingElement.textContent = "Following: " + data.following;
      if (reposElement) reposElement.textContent = "Repos: " + data.public_repos;
      if (githubTile) githubTile.href = data.html_url;
      return;
    })
    .catch(error => {
      console.error('Error fetching GitHub information:', error);
    });
}
