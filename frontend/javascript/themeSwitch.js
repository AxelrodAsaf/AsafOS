const toggle = document.getElementById('theme-switch-input');
const dynatraceImg = document.getElementById('dynatrace-img');

if (toggle) {
  const storedTheme = localStorage.getItem('theme');
  if (storedTheme) {
    toggle.checked = storedTheme === 'dark';
    updateTheme(toggle.checked);
  } else {
    updateMapStyle('alidade_smooth');
  }

  toggle.addEventListener('click', function () {
    const isDarkMode = toggle.checked;
    updateTheme(isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  });
} else {
  console.error('Element with id "theme-switch-input" not found.');
}

export function updateTheme(isDarkMode) {
  const mapStyle = isDarkMode ? 'alidade_smooth_dark' : 'alidade_smooth';
  dynatraceImg.src = isDarkMode ? './assets/DYNATRACEWHITE.png' : './assets/DYNATRACE.png';

  if (isDarkMode) {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }
  updateMapStyle(mapStyle);
}
