
$(document).ready(function () {
    $("#result").hide() // 默认隐藏
    $("#vis_png").hide()
    

    // 有结果，渲染表格
    if (!isEmpty(results) && !isEmpty(vis_date_results)) {
        $("#result").show()
        renderResult();
        //渲染图片 
        png_base64 = vis_date_results['visible_png']
        if (png_base64 != "") {
            $("#vis_png").show()
            document.getElementById('vis_png').src = `data:image/png;base64,${vis_date_results['visible_png']}`;
        } else {
            $("#vis_png").hide()
        }
    }
    // 无结果，但输入完整，继续POST
    else if (start_time!="" && start_time !='None' && end_time!="None" && end_time!="" ){
        // document.forms['TargetVisilibityForm'].submit();
    }
    // 等待继续输入
    else {
        $("#result").hide()
    }

    renderForm();


});

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}
function digit3(num) {
    return Number.parseFloat(num.toFixed(3));
}

function renderForm() {
    var dateNow = new Date();
    var dateStart = new Date();
    dateStart.setDate(dateNow.getDate() - 3);
    dateStart.setHours(0, 0, 0, 0);
    var dateEnd = new Date();
    dateEnd.setDate(dateNow.getDate() + 1);
    dateEnd.setHours(0, 0, 0, 0);
    $("#start_time").datetimepicker({
        allowInputToggle: true,
        showClose: false,
        showClear: false,
        showTodayButton: false,
        useCurrent: false,
        format: "YYYY-MM-DDTHH:mm:ss",
        defaultDate: dateStart,
    }).attr("autocomplete", "off");
    $("#end_time").datetimepicker({
        allowInputToggle: true,
        showClose: false,
        showClear: false,
        showTodayButton: false,
        useCurrent: false,
        format: "YYYY-MM-DDTHH:mm:ss",
        defaultDate: dateEnd,
    }).attr("augocomplete", "off");
    if (ra != 'None') {
        $('#ra').val(ra);
    }
    else {
        $('#ra').val("0");
    }
    if (dec != 'None') {
        $('#dec').val(dec);
    }
    else {
        $('#dec').val("0");
    }
    if (start_time != 'None') {
        $('#start_time').val(start_time);
    }

    if (end_time != 'None') {
        $('#end_time').val(end_time);
    }
}

/**
 * 渲染结果：两个表格，一个图片
 */
function renderResult() {
    var table = new Tabulator("#result_tab", {
        data: results,
        layout: "fitColumns",
        columns: [
            {
                title: "index",
                formatter: "rownum",
                hozAlign: "center",
            },
            {
                title: "Date", field: "date", sorter: "datetime", formatterParams: {
                    inputFormat: "iso",
                    outputFormat: "yyyy-MM-dd HH:mm:ss",
                    invalidPlaceholder: "(invalid date)",
                    timezone: "utc",
                },
            },
            {
                title: "Solar angle", field: "angle_sun", formatter: function (cell, formatterParams, onRendered) {
                    return digit3(cell.getValue());
                }, sorter: "number"
            },
            {
                title: "Moon angle", field: "angle_moon", formatter: function (cell, formatterParams, onRendered) {
                    return digit3(cell.getValue());
                }, sorter: "number"
            },
            { title: "Sun violation", field: "test_sun", sorter: "number" },
            { title: "Moon violation", field: "test_moon", sorter: "number" },
            { title: "Visible", field: "test_sunmoon", sorter: "number" },
        ],
    });

    document.getElementById('vis_png').src = `data:image/png;base64,${vis_date_results['visible_png']}`;
    var vis_table = new Tabulator("#vis_date_tab", {
        data: vis_date_results['visible_date_list'],
        layout: "fitColumns",
        columns: [
            {
                title: "index",
                formatter: "rownum",
                hozAlign: "center",
            },
            {
                title: "Start Date", field: "visible_start", sorter: "datetime", formatterParams: {
                    inputFormat: "iso",
                    outputFormat: "yyyy-MM-dd HH:mm:ss",
                    invalidPlaceholder: "(invalid date)",
                    timezone: "utc",
                },
            },
            {
                title: "End Date", field: "visible_end", sorter: "datetime", formatterParams: {
                    inputFormat: "iso",
                    outputFormat: "yyyy-MM-dd HH:mm:ss",
                    invalidPlaceholder: "(invalid date)",
                    timezone: "utc",
                },
            },
        ],
    });
}
