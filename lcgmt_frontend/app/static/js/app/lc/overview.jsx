const headerTitleStyle = {
  color: "#004386",
  fontWeight: "bold",
  fontSize: "16px",
};

/**
 *
 * @param {string} item
 */
function LcCard(item) {
  return (
    <div
      className="card w-100 light-curve"
      classification={`${item.classification}`}
    >
      <div className="card-header bg-light">
        <div className="card-header-title" style={headerTitleStyle}>
          {item.simbad_name}
        </div>
      </div>
      <div className="card-body"></div>
    </div>
  );
}

/**
 * 筛选框
 * @param {Array<string>} classifications
 */
function Selector(classifications) {
  /**
   * 选择事件：进行筛选
   * @param {} e
   */
  function select() {
    let value = document.getElementById("classification-selector").value;
    if (value == "All") {
      $(".light-curve").show();
    } else {
      $(".light-curve").hide();
      $(`[classification='${value}']`).show();
    }
  }
  return (
    <div className="card w-100">
      <div className="card-header bg-light">
        <div className="card-header-title" style={headerTitleStyle}>
          Filter
        </div>
      </div>
      <div className="card-body">
        <div className="row">
          <div className=" col-2">Classification:</div>
          <div className="col-3">
            <select
              className="form-control"
              onChange={select}
              id="classification-selector"
            >
              {classifications.map((item) => (
                <option>{item}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
