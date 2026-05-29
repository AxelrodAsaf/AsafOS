const githubUsername = "AxelrodAsaf";

const buildLast7Days = () => {
  const days = [];
  const today = new Date();

  for (let offset = 6; offset >= 0; offset -= 1) {
    const day = new Date(today);
    day.setHours(0, 0, 0, 0);
    day.setDate(today.getDate() - offset);
    days.push(day.toISOString().slice(0, 10));
  }

  return days;
};

const buildGitHubActivityGeometry = (counts) => {
  if (!Array.isArray(counts) || counts.length === 0) {
    return { linePath: "", areaPath: "", axis: null };
  }

  const left = 2;
  const right = 98;
  const top = 52;
  const bottom = 98;
  const maxCount = Math.max(1, ...counts);

  const points = counts.map((count, index) => {
    const x = left + (index / Math.max(1, counts.length - 1)) * (right - left);
    const y = bottom - (count / maxCount) * (bottom - top);
    return [x, y];
  });

  const linePath = points
    .map(([x, y], index) => `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`)
    .join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1][0].toFixed(2)} ${bottom} L ${points[0][0].toFixed(2)} ${bottom} Z`;

  return {
    linePath,
    areaPath,
    axis: {
      x1: left,
      y1: bottom,
      x2: right,
      y2: bottom
    }
  };
};

const updateGitHubActivityChart = (events, repos) => {
  const last7Days = buildLast7Days();
  const countsByDay = new Map(last7Days.map((day) => [day, 0]));

  events.forEach((event) => {
    const day = event?.created_at?.slice(0, 10);

    if (day && countsByDay.has(day)) {
      countsByDay.set(day, countsByDay.get(day) + 1);
    }
  });

  repos.forEach((repo) => {
    const day = repo?.pushed_at?.slice(0, 10);

    if (day && countsByDay.has(day)) {
      countsByDay.set(day, countsByDay.get(day) + 1);
    }
  });

  const counts = last7Days.map((day) => countsByDay.get(day) ?? 0);
  const { linePath, areaPath, axis } = buildGitHubActivityGeometry(counts);
  const line = document.getElementById("github-activity-line");
  const area = document.getElementById("github-activity-area");
  const baseline = document.getElementById("github-activity-axis");

  if (line) {
    line.setAttribute("d", linePath);
  }

  if (area) {
    area.setAttribute("d", areaPath);
  }

  if (baseline && axis) {
    baseline.setAttribute("x1", axis.x1);
    baseline.setAttribute("y1", axis.y1);
    baseline.setAttribute("x2", axis.x2);
    baseline.setAttribute("y2", axis.y2);
  }
};

export const updateGitHubCard = async () => {
  const [profileResponse, eventsResponse, reposResponse] = await Promise.all([
    fetch(`https://api.github.com/users/${githubUsername}`),
    fetch(`https://api.github.com/users/${githubUsername}/events/public?per_page=100`),
    fetch(`https://api.github.com/users/${githubUsername}/repos?per_page=100&sort=pushed`)
  ]);

  if (!profileResponse.ok) {
    throw new Error(`GitHub request failed with ${profileResponse.status}`);
  }

  const profile = await profileResponse.json();
  const events = eventsResponse.ok ? await eventsResponse.json() : [];
  const repos = reposResponse.ok ? await reposResponse.json() : [];

  document.getElementById("github-followers").textContent =
    `Followers: ${profile.followers}`;
  document.getElementById("github-following").textContent =
    `Following: ${profile.following}`;
  document.getElementById("github-repos").textContent =
    `Repos: ${profile.public_repos}`;

  document.getElementById("github-link").href =
    profile.html_url ?? `https://github.com/${githubUsername}/`;

  updateGitHubActivityChart(
    Array.isArray(events) ? events : [],
    Array.isArray(repos) ? repos : []
  );
};
