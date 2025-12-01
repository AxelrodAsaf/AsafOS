import time
import datetime
import json
import psutil
import gzip
from seleniumwire import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.common.exceptions import NoSuchElementException

# Configuration
VISIBLE_UI = False
LEAVE_OPEN = True
LOOP = False
WAIT_TIME = 60
SHORT_WAIT = 30
RECENT_SONGS_API_URL = "api.spotify.com/v1/me/player/recently-played"
STATS_SPOTIFY_RECENT_SONGS_URL = "/track/recent"
CREDENTIALS_FILE = 'credentials.json'
RECENT_SONGS_FILE = 'recentSongs.json'
ALL_SONGS_FILE = 'allSongs.json'

COLORS = {
    'red': '\033[31m', 'green': '\033[32m', 'yellow': '\033[33m',
    'blue': '\033[34m', 'cyan': '\033[36m', 'endc': '\033[0m'
}

def print_color(message, color='endc'):
    print(f"{COLORS[color]}[{datetime.datetime.now():%H:%M:%S}] {message}{COLORS['endc']}")

def close_all_drivers():
    for proc in psutil.process_iter(['pid', 'name']):
        if 'chromedriver' in proc.info['name'].lower():
            print_color(f"Terminating ChromeDriver: {proc.info['pid']}", 'red')
            proc.terminate()

def wait_for_element(driver, by, value, timeout=SHORT_WAIT):
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            return driver.find_element(by, value)
        except NoSuchElementException:
            time.sleep(0.5)
    print_color(f"Timeout: {by}={value}", 'red')
    return None

def click_element(driver, by, value, retry_msg=None, retry_action=None):
    element = wait_for_element(driver, by, value)
    if element:
        time.sleep(0.25)
        element.click()
        print_color(f"Clicked: {by}={value}", 'cyan')
        return True
    if retry_msg and retry_action:
        print_color(retry_msg, 'yellow')
        retry_action()
        time.sleep(SHORT_WAIT)
        element = wait_for_element(driver, by, value)
        if element:
            element.click()
            print_color(f"Clicked (retry): {by}={value}", 'cyan')
            return True
    return False

def send_keys(driver, by, value, keys, retry_msg=None, retry_action=None):
    element = wait_for_element(driver, by, value)
    if element:
        element.send_keys(keys)
        print_color(f"Sent '{keys}' to: {by}={value}", 'cyan')
        return True
    if retry_msg and retry_action:
        print_color(retry_msg, 'yellow')
        retry_action()
        time.sleep(SHORT_WAIT)
        element = wait_for_element(driver, by, value)
        if element:
            element.send_keys(keys)
            print_color(f"Sent '{keys}' (retry): {by}={value}", 'cyan')
            return True
    return False

def wait_for_url(driver, target, timeout=30):
    start_time = time.time()
    while time.time() - start_time < timeout:
        if target in driver.current_url:
            return True
        time.sleep(1)
    return False

def sign_in(driver, email, password):
    try:
        driver.get("https://statsforspotify.com" + STATS_SPOTIFY_RECENT_SONGS_URL)
        print_color("Opened StatsForSpotify", 'blue')
        retry = lambda: click_element(driver, By.CSS_SELECTOR, "#root > div > div > div > div > ul > li:nth-child(2) > button")

        if click_element(driver, By.CSS_SELECTOR, "#root > div > div > div > div > ul > li:nth-child(2) > button"):
            print_color("Clicked Facebook sign-in", 'blue')

        if send_keys(driver, By.ID, "email", email, retry_msg="Retrying email...", retry_action=retry) and send_keys(driver, By.ID, "pass", password):
            print_color("Entered credentials", 'blue')
            time.sleep(0.2)
            driver.find_element(By.CSS_SELECTOR, "#loginbutton").click()
            print_color("Clicked Facebook login", 'blue')

        start = time.time()
        while "facebook" in driver.current_url:
            if time.time() - start > WAIT_TIME:
                print_color("Facebook redirect timeout. Retrying...", 'red')
                driver.refresh()
                time.sleep(2)
                retry()
                start = time.time()
            time.sleep(0.5)

        if wait_for_url(driver, "accounts.spotify.com/en/authorize/", timeout=SHORT_WAIT):
            attempts = 0
            while "accounts.spotify.com/en/authorize/" in driver.current_url:
                if attempts > 3:
                    raise RuntimeError("Authorization failed.")
                click_element(driver, By.CSS_SELECTOR, "#encore-web-main-content > div > main > section > div > div > div:nth-child(6) > button > span.ButtonInner-sc-14ud5tc-0.dOeYIb.encore-bright-accent-set")
                print_color("Clicked Spotify authorize", 'blue')
                attempts += 1
            if STATS_SPOTIFY_RECENT_SONGS_URL not in driver.current_url:
                raise RuntimeError("Redirect failed after authorization.")
            print_color("Signed in and authorized", 'green')
            return True
        else:
            raise RuntimeError("Spotify authorization redirect failed.")
    except (NoSuchElementException, RuntimeError, Exception) as e:
        print_color(f"Sign-in error: {e}", 'red')
        return False

def save_data(driver, api_url, target_url, file_name):
    data = []
    driver.get("https://statsforspotify.com" + target_url)
    print_color(f"Navigating: {target_url}", 'yellow')

    def is_api_response(request):
        return api_url in request.url and request.response

    def process_response(request):
        try:
            content = gzip.decompress(request.response.body) if request.response.headers.get('Content-Encoding') == 'gzip' else request.response.body
            return json.loads(content)
        except (gzip.BadGzipFile, json.JSONDecodeError, TypeError):
            return None

    start = time.time()
    while time.time() - start < WAIT_TIME:
        time.sleep(1)
        for req in driver.requests:
            if is_api_response(req):
                res = process_response(req)
                if res and 'items' in res:
                    items = res['items']
                    if file_name == 'topArtists.json':
                        data.extend({"artistName": item['name'], "artistUrl": item['external_urls']['spotify'], "artistImage": max(item['images'], key=lambda x: x['height'])['url']} for item in items)
                    elif file_name == RECENT_SONGS_FILE:
                        data.extend({"trackName": item['track']['name'], "albumName": item['track']['album']['name'], "artistName": item['track']['album']['artists'][0]['name'], "albumImage": max(item['track']['album']['images'], key=lambda x: x['height'])['url'], "spotifyUrl": item['track']['external_urls']['spotify']} for item in items)
                    with open(file_name, 'w', encoding='utf-8') as f:
                        json.dump(data, f, ensure_ascii=False, indent=2)
                    print_color(f"Saved: {file_name}", 'green')
                    return True
    print_color(f"No API response: {api_url}", 'red')
    return False

def append_songs(file_name):
    try:
        with open(ALL_SONGS_FILE, 'r', encoding='utf-8') as f:
            all_songs = json.load(f)
    except FileNotFoundError:
        all_songs = []
    try:
        with open(file_name, 'r', encoding='utf-8') as f:
            new_songs = json.load(f)
    except FileNotFoundError:
        print_color(f"File not found: {file_name}", 'red')
        return
    existing = {json.dumps(song, sort_keys=True) for song in all_songs}
    all_songs.extend(song for song in new_songs if json.dumps(song, sort_keys=True) not in existing)
    with open(ALL_SONGS_FILE, 'w', encoding='utf-8') as f:
        json.dump(all_songs, f, ensure_ascii=False, indent=2)
    print_color(f"Appended to: {ALL_SONGS_FILE}", 'green')

def initialize_driver():
    print_color("Initializing WebDriver...", 'blue')
    options = webdriver.ChromeOptions()
    if not VISIBLE_UI:
        options.add_argument("--headless")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.page_load_strategy = 'none'
    try:
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=options)
        print_color("WebDriver initialized", 'blue')
        return driver
    except Exception as e:
        print_color(f"WebDriver init failed: {e}", 'red')
        return None

def load_credentials():
    try:
        with open(CREDENTIALS_FILE, 'r') as f:
            creds = json.load(f)
        print_color(f"Loaded credentials: {CREDENTIALS_FILE}", 'blue')
        return creds['facebookEmail'], creds['facebookPassword']
    except FileNotFoundError:
        print_color(f"Credentials file not found: {CREDENTIALS_FILE}", 'red')
        return None, None
    except json.JSONDecodeError:
        print_color(f"Invalid credentials file format: {CREDENTIALS_FILE}", 'red')
        return None, None

def run_script():
    print_color("Starting script...", 'blue')
    try:
        close_all_drivers()
        driver = initialize_driver()
        if not driver:
            raise RuntimeError("WebDriver init failed.")
        email, password = load_credentials()
        if not email or not password:
            raise RuntimeError("Credentials load failed.")
        if not sign_in(driver, email, password):
            raise RuntimeError("Sign-in failed.")
        while LOOP:
            if save_data(driver, RECENT_SONGS_API_URL, STATS_SPOTIFY_RECENT_SONGS_URL, RECENT_SONGS_FILE):
                append_songs(RECENT_SONGS_FILE)
            time.sleep(5 * 60)
    except KeyboardInterrupt:
        print_color("Script terminated by user.", 'red')
    except Exception as e:
        print_color(f"Error: {e}", 'red')
    finally:
        if LEAVE_OPEN:
            time.sleep(120)
        if driver:
            driver.quit()

if __name__ == "__main__":
    run_script()