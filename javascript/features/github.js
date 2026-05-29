export const updateGitHubCard = async () => {
  const response = await fetch("https://api.github.com/users/AxelrodAsaf");

  if (!response.ok) {
    throw new Error(`GitHub request failed with ${response.status}`);
  }

  const profile = await response.json();

  document.getElementById("github-followers").textContent =
    `Followers: ${profile.followers}`;
  document.getElementById("github-following").textContent =
    `Following: ${profile.following}`;
  document.getElementById("github-repos").textContent =
    `Repos: ${profile.public_repos}`;

  document.getElementById("github-link").href =
    profile.html_url ?? "https://github.com/AxelrodAsaf/";
};
