function get_xray_counterparts(ra,dec, radius, flux) {
    $("#spinner-div-xray").show();
    $.ajax({
        type: "GET",
    
        url: xray_api_url,
        // dataType: "json",
        data: {  ra: ra, dec: dec, radius: radius, flux: flux, scale: 1,prob_threshold:0.0 },
        success: function (res) {
      
            var table = new Tabulator("#xray_result_tab", {
                data: res['xray_epref'],
                //data: res,
                selectable: 1,
                dataTree: true,
                height: 100,
                scrollToRowIfVisible: true,
                layout: "fitDataFill",
                columns: [
                    { title: "Name", field: "ref_name"},
                    { title: "RA", field: "ra",sorter:"number", formatter: "money", formatterParams: { symbol: "", precision: 3 }},
                    { title: "Dec", field: "dec",sorter:"number", formatter: "money", formatterParams: { symbol: "", precision: 3 }},
                    { title: "Pos Err", field: "pos_err",sorter:"number", formatter: "money", formatterParams: { symbol: "", precision: 3 }},
                    { title: "Sep", field: "Separation_max",sorter:"number", formatter: "money", formatterParams: { symbol: "", precision: 3 }},
                    { title: "Flux", field: "flux", sorter:"number",  formatter: function (cell, formatterParams, onRendered) {
                        return cell.getValue().toExponential(3);
                      }},
                    { title: "Prob", field: "prob_this_match",  formatter: function (cell, formatterParams, onRendered) {
                        return cell.getValue().toExponential(3);
                      }},
                    { title: "p_single", field: "p_single",  formatter: function (cell, formatterParams, onRendered) {
                        return cell.getValue().toExponential(3);
                      }},
                    { title: "ID", field: "xray_epref"},
                   
                ],
            });
            result_table = table;
    
            result_table.on("rowSelected", function (row) {
                if (lastSelectedRow != undefined && lastSelectedRow._row.data.id == row._row.data.id) {
                    return;
                }
                clearSelectedRow();
                lastSelectedRow = row;
    
                if (objClicked != undefined) {
                    objClicked.deselect();
                }
    
                aladin.gotoRaDec(row.getData().pnt_ra, row.getData().pnt_dec);
                // console.log(row.getData());
                var footprint = aladin.layerByName("fov").overlays.filter((footprint) => {
                    return footprint.name == row.getData().id;
                })[0];
                footprint.select();
                // console.log(footprint);
                objClicked = footprint;
            });
    
            // addFov(res,fxtFovOverlay);
            $("#spinner-div-xray").hide(); //Request is complete so hide spinner
        },
        error: function () { },
        complete: function () { },
    });
}