from pytest import fixture
from msedge.selenium_tools import EdgeOptions, Edge
from selenium.webdriver.remote.webdriver import WebDriver, WebElement

from tests.app.templates.wait_for import wait_for
@fixture(scope="session")
def browser():
    options = EdgeOptions()
    options.use_chromium = True
    options.binary_location = r"/usr/bin/microsoft-edge"
    options.set_capability("platform", "LINUX")
    # options.add_argument("headless")
    webdriver_path = r"/home/mengdan/.local/bin/msedgedriver"

    return Edge(options=options, executable_path=webdriver_path )

@fixture(scope="session")
def logged_in(browser:WebDriver):
    browser.get("http://localhost:5000/user/login")
    email_inputbox:WebElement = browser.find_element_by_id("email")
    email_inputbox.send_keys("a@b.com")
    password_inputbox:WebElement = browser.find_element_by_id("password")
    password_inputbox.send_keys("a@b.com")
    verify_inputbox:WebElement = browser.find_element_by_name("verify_code")
    verify_inputbox.send_keys("0000")
    login_btn:WebElement = browser.find_element_by_xpath("//form//input[@type='submit']")
    login_btn.click()

    wait_for(lambda:browser.title.find("Home")!=-1)

    return browser