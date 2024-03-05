"""使用selenium测试observation_data.py"""
from pytest import fixture, mark, skip
from pytest_mock import MockerFixture
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.remote.webelement import WebElement
from selenium.webdriver.common.alert import Alert
from tests.app.templates.wait_for import wait_for
import time
# Launch Microsoft Edge (EdgeHTML)

@fixture
def obs_data_page(logged_in):
    """进入到observation data 页面"""
    browser:WebDriver = logged_in
    browser.get("http://localhost:5000/data_center/observation_data")
    return browser

@mark.e2e
def test_resolver_when_exist_then_set_radec(obs_data_page):
    # 打开网页
    browser:WebDriver = obs_data_page
    
    # 登录 (放在了logged_in fixture中)

    # 进入observation data页面
    browser.get("http://localhost:5000/data_center/observation_data")
    
    # 输入Objname
    obj_name_input:WebElement = browser.find_element_by_id("object_name")
    obj_name_input.send_keys("m31")
    
    # 点击解析
    resolve_btn:WebElement = browser.find_element_by_id("resolve")
    resolve_btn.click()

    # Assert: 成功，设置ra，dec
    ra_input:WebElement = browser.find_element_by_id("ra")
    dec_input:WebElement = browser.find_element_by_id("dec")
    wait_for(lambda:ra_input.get_property('value')!="")
    assert ra_input.get_property('value') == "10.6847083"
    assert dec_input.get_property('value') == "41.2687500"

@mark.e2e
def test_resolver_when_notexist_alert(obs_data_page):
    # 打开网页
    browser:WebDriver = obs_data_page
    
    # 输入 objname（不存在）
    obj_name_input:WebElement = browser.find_element_by_id("object_name")
    obj_name_input.send_keys("bucunzai")

    # 点击解析
    resolve_btn:WebElement = browser.find_element_by_id("resolve")
    resolve_btn.click()
    time.sleep(1)
    alert:Alert  = browser.switch_to.alert
    
    # 断言alert
    
    assert alert.text == "源名称解析失败"
    alert.accept()

@mark.e2e
def test_download(obs_data_page):
    pass
    