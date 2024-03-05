
var wxtFovOverlay = A.graphicOverlay({ name: "wxt_fov", color: "#bd7e2e", lineWidth: 1 });
var currentFovOverlay = A.graphicOverlay({ name: "current_fov", color: "red", lineWidth: 1 });
var fxtFovOverlay = A.graphicOverlay({ name: "fxt_fov", color: "yellow", lineWidth: 1 });
A.init.then(() => {

})
/**
 * 
 * @param {number} ra 
 * @param {number} dec 
 */
function GetObsInSourceLocation(ra, dec) {
    
    var obs_id = "";
    var radius = "0.167";
    var start_datetime = "";
    var end_datetime = "";

    // 添加MWR星表
    aladin.removeLayers();
    addCatalogues();
    addErrorCircle(ra, kec, radius);

    // 注册FOV相关图层
    aladin.addOverlay(wxtFovOverlay);
    aladin.addOverlay(fxtFovOverlay);
    aladin.addOverlay(currentFovOverlay);
    // 检索WXT、FXT的结果并显示在图层上
    // getFxtObsInSourceLocation(ra, dec);
    getWXTObsInSourceLocation(ra, dec)

}

function getWXTObsInSourceLocation(ra, dec) {
    var obs_id = "";
    var radius = "0.167";
    var start_datetime = "";
    var end_datetime = "";
    $("#spinner-div").show();
    $.ajax({
        type: "POST",
        url: sy01_api_url,
        dataType: "json",
        data: { obs_id: obs_id, ra: ra, dec: dec, radius: radius, start_time: start_datetime, end_time: end_datetime },
        success: function (res) {
            $(".wxt_obs_num_sor_loc").html(res.length);
            var table = new Tabulator("#result_tab", {
                data: mergeSameObsId(res),
                //data: res,
                selectable: 1,
                dataTree: true,
                height: 300,
                scrollToRowIfVisible: true,
                layout: "fitDataFill",
                columns: [
                    { title: "OBS ID", field: "obs_id", sorter: "string" },
                    { title: "CMOS ID", field: "detnam", sorter: "string" },
                    {
                        title: "",
                        formatter: gotoIcon,
                        width: 50,
                        hozAlign: "center",
                        tooltip: "Go to Obs Location",

                        cellClick: function (e, cell) {
                            gotoLocation(cell.getRow().getData().pnt_ra, cell.getRow().getData().pnt_dec);
                        },
                    },
                    {
                        title: "",
                        formatter: imageIcon,
                        width: 50,
                        hozAlign: "center",
                        tooltip: "Show Quicklook Image",

                        cellClick: function (e, cell) {
                            showQuicklook(cell.getRow().getData().obs_id, cell.getRow().getData().detnam, cell.getRow().getData().version);
                        },
                    },
                    {
                        title: "",
                        formatter: downloadIcon,
                        width: 50,
                        hozAlign: "center",
                        tooltip: "Download Level2-3 Data",
                        cellClick: function (e, cell) {
                            downloadLevel2(cell.getRow().getData().obs_id, cell.getRow().getData().detnam, cell.getRow().getData().version);
                        },
                    },
                    {
                        title: "",
                        formatter: detailIcon,
                        width: 50,
                        hozAlign: "center",
                        tooltip: "Show Detail",

                        cellClick: function (e, cell) {
                            showObsDetailPage(cell.getRow().getData().obs_id, cell.getRow().getData().detnam);
                        },
                    },
                    {
                        title: "Pointing RA", field: "pnt_ra", sorter: "number", formatter: function (cell, formatterParams, onRendered) {
                            return digit3(cell.getValue())
                        }
                    },
                    {
                        title: "Pointing Dec", field: "pnt_dec", sorter: "number", formatter: function (cell, formatterParams, onRendered) {
                            return digit3(cell.getValue())
                        }
                    },
                    {
                        title: "Exposure Time", field: "exposure_time", sorter: "string", formatter: function (cell, formatterParams, onRendered) {
                            return digit0(cell.getValue())
                        }
                    },
                    {
                        title: "Obs Start Time", field: "obs_start", formatter: "datetime",
                        formatterParams: {
                            inputFormat: "iso",
                            outputFormat: "yyyy-MM-dd HH:mm:ss",
                            invalidPlaceholder: "(invalid date)",
                            timezone: 'utc'
                        },
                    },
                    {
                        title: "Obs End Time", field: "obs_end", formatter: "datetime",
                        formatterParams: {
                            inputFormat: "iso",
                            outputFormat: "yyyy-MM-dd HH:mm:ss",
                            invalidPlaceholder: "(invalid date)",
                            timezone: 'utc'
                        },
                    },
                    { title: "ID", field: "id", sorter: "number" },
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

            addFov(res,wxtFovOverlay);
            $("#spinner-div").hide(); //Request is complete so hide spinner
        },
        error: function () { },
        complete: function () { },
    });
}

function getFxtObsInSourceLocation(ra, dec) {
    var obs_id = "";
    var radius = "0.167";
    var start_datetime = "";
    var end_datetime = "";
    $("#spinner-div").show();
    $.ajax({
        type: "POST",
        // url: sy01_api_url,
        url: fxt_api_url,
        dataType: "json",
        data: { obs_id: obs_id, ra: ra, dec: dec, radius: radius, start_time: start_datetime, end_time: end_datetime },
        success: function (res) {
            $(".fxt_obs_num_sor_loc").html(res.length);
            var table = new Tabulator("#fxt_result_tab", {
                data: mergeSameObsId(res),
                //data: res,
                selectable: 1,
                dataTree: true,
                height: 300,
                scrollToRowIfVisible: true,
                layout: "fitDataFill",
                columns: [
                    { title: "Obs ID", field: "obs_id", formatter: "link",formatterParams:{url:(item)=>{return item.getData()['obs_detail']},target:"_blank"}},
                    { title: "Module", field: "detnam" },
                    { title: "OBJ_RA", field: "obj_ra" ,sorter:"number", formatter: "money", formatterParams: { symbol: "", precision: 3 }}, 
                    { title: "OBJ_DEC", field: "obj_dec" ,sorter:"number", formatter: "money", formatterParams: { symbol: "", precision: 3 }},
                    { title: "PNT_RA", field: "pnt_ra" ,sorter:"number", formatter: "money", formatterParams: { symbol: "", precision: 3 }}, 
                    { title: "PNT_DEC", field: "pnt_dec" ,sorter:"number", formatter: "money", formatterParams: { symbol: "", precision: 3 }},
                    { title: "Obs Mode", field: "obs_mode" },
                    { title: "Name", field: "object_name" },
                    { title: "S_Time", field: "obs_start" },
                    { title: "Data Mode", field: "data_mode" },
                    { title: "Observer", field: "observer" },
                    { title: "Version", field: "version" },
     
                     { title: "Exposure Time", field: "exposure_time" ,sorter:"number", formatter: "money", formatterParams: { symbol: "", precision: 3 }},
                ],
            });
            result_table = table;

            result_table.on("rowSelected", function (row) {
              3 if (lastSelectedRow != undefined && lastSelectedRow._row.data.id == row._row.data.id) {
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

            addFov(res,fxtFovOverlay);
            $("#spinner-div").hide(); //Request is complete so hide spinner
        },
        error: function () { },
        complete: function () { },
    });
}

// function showFXTObsDetailPage()

function addFov(res,overlay) {
    // var res =currentRes;
    var start = new Date().getTime();
    if(res['success']!='no result')
    // aladin.setFrame('J2000d');
    for (var item of res) {
        var payload = [];
        var fovSTCS1 = getFovPolySTCS(item.fov_new);
        if (fovSTCS1 == "-1") {
            continue;
        }
        var footprints = A.footprintsFromSTCS(fovSTCS1);
        footprints[0].setName(item.id);
        // console.log(footprints);
        // overlay.addFootprints([A.polygon([ [75.09706569902252, 28.254025356561616],[85.65058303267622, 29.095894440421656],[85.04345555479651, 38.3910524704836],[73.31926048625968, 37.399614744176404],[75.09706569902252, 28.254025356561616]])]);
        
        
        //   if(item['id']=={{sourceInDetection.detection.id}})
        overlay.addFootprints(footprints);
        if (item['id'] == 1) {
            // footprints[0].select();
            currentFovOverlay.addFootprints(footprints);
        }
    }
    var end = new Date().getTime();
}





