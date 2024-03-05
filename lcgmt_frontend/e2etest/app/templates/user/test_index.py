"""
测试已登录用户
"""
from selenium.webdriver.remote.webdriver import WebElement,WebDriver


def test_logged_in(logged_in:WebDriver):
    browser = logged_in
    browser.get("http://localhost:5000/user/")
    email_content:WebElement = browser.find_element_by_xpath("//ul[@class='user-profile-contact']")
    assert email_content.text.find("a@b.com") != -1