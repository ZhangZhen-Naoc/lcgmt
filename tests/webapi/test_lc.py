
from flask.testing import FlaskClient
from pytest import approx,mark
from pytest_mock import MockFixture, MockerFixture
import json

@mark.xfail
def test_lc(client:FlaskClient):
    """测试routes。主要测试编码，解码，不考虑逻辑正确性

    Args:
        client (FlaskClient): [description]
    """
    resp = client.post("/lc",json={
        "srcid":1, 
        "energy":[0,2], 
        "start_time":"2020-1-1 00:00:00",
        "end_time":"2020-1-2 00:00:00",
        "timebin":1
    })
    assert resp.status_code == 200
    data = json.loads(resp.data.decode())
    # assert 与 conftest文件中对应。
    assert data['srcid'] == 1 # 来自post输入
    assert data['energy'] == [0,2] # 来自输入的energy
    
    
    obs1 = data['obses']['1']
    obs2 = data['obses']['2']
    
    assert obs1['times'][0] == "2020-01-01 00:00:00"
    assert obs1['flux'][0] == approx(10)

@mark.xfail
def test_lc_from_ra_dec(client:FlaskClient, mocker:MockFixture):
    engine_spy = mocker.spy(client.application.config['engine'],"get_obs_by_timerange")
    resp = client.post("/lc/0.0/0.0",json={
        "energy":[0,2], 
        "start_time":"2020-1-1 00:00:00",
        "end_time":"2020-1-2 00:00:00",
        "timebin":1
    })
    assert resp.status_code == 200
    data = json.loads(resp.data.decode())
    assert data['srcid'] == 1 # 与conftest对应
    
