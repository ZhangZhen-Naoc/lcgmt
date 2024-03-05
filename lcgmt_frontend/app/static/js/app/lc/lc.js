function convertMJDToDatetime(mjd) {
  var unixTimestamp = (mjd + 2400000.5 - 2440587.5) * 86400;
  var dateTime = new Date(unixTimestamp * 1000);


  return dateTime;
}
function deepCopy(obj) {
   if (typeof obj !== 'object' || obj === null) {
      return obj;
   }

   let clone = Array.isArray(obj) ? [] : {};

   for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
         clone[key] = deepCopy(obj[key]);
      }
   }

   return clone;
}

function strftime(date){
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  return `${year}-${month}-${day}`
}

function renderErrorBar(params, api) {
    var xValue = api.value(0);
    var highPoint = api.coord([xValue, api.value(1)]); //高点
    var lowPoint = api.coord([xValue, api.value(2)]); //低点
    // var halfWidth = api.size([1, 0])[0] * 0.1; //半宽度

    var style = api.style({
        stroke: api.visual('color'),
        fill: null,

    });

    return {
        type: 'group',
        children: [

            {
                type: 'line',
                shape: {
                    x1: highPoint[0],
                    y1: highPoint[1],
                    x2: lowPoint[0],
                    y2: lowPoint[1]
                },
                style: style
            },

        ]
    };

}
var xAxis_option = [
    {
        type: 'value',
        data: null,
        scale: true,
        name: "MJD",
        min: function (value) {
            return value.min - 20;
        },
        // nameLocation:"center",
        //nameTextStyle:{
        //    "verticalAlign":"bottom",
        //},
        axisLabel: {
            formatter: (v) => {
                var utc = strftime(convertMJDToDatetime(v))
                return `${v}\n${utc}`
            },

        },
    },

]

var yAxis_option = {
    type: 'value',
    show: true,
    axisLine: {
        show: true,
    },
    lineStyle: {
        color: '#333',    // 坐标轴线线的颜色
        width: '5',    // 坐标轴线线宽
        type: 'solid',     // 坐标轴线线的类型（'solid'，实线类型；'dashed'，虚线类型；'dotted',点状类型）
    },
}
var tooltip = {
    trigger: 'axis',
    axisPointer: {            // 坐标轴指示器，坐标轴触发有效
        type: 'line'        // 默认为直线，可选为：'line' | 'shadow'
    },
    formatter: null
}
var flux_option = {
    title: {
        text: ``
    },
    color: ['#788DD2'],
    xAxis: xAxis_option,
    yAxis: {
        type: "value",
        name: "Flux 1e-11 erg/s/cm2",
        nameLocation: "end",
        show: true,
        axisLine: {
            show: true,
        },
    },
    tooltip,
    series: [
        {
            data: null,
            type: 'scatter',
            symbolSize: 5,
            name: 'flux'
        },
        {
            data: null,
            type: 'scatter',
            symbolSize: 7,
            name: 'upperlimit',
            symbol: 'path://M0,0 L1,1 L2,0',
            color: 'grey'


        },
        {
            type: "custom",
            itemStyle: {
                normal: {
                    borderWidth: 1.5
                }
            },
            renderItem: renderErrorBar,
            data: null,
        },


    ],
    brush: {
        xAxisIndex: 'all',
        brushLink: 'all',
        outOfBrush: {
            colorAlpha: 0.1
        }
    },
    toolbox: {
        feature: {
            dataZoom: {
                yAxisIndex: false
            },
            brush: {
                type: ['lineX', 'clear']
            }
        }
    }
};

/**
 * 
 * @param {Element} item 要渲染的DOM div
 * @param {Array<Array>} time_flux [[time,flux],[time,flux]] 格式
 * @param {Array<Array>} time_upperlimits 
 * @param {Array<Array} time_flux_err
 * @param {Array<string>} flux_names
 * @param {Array<string>} upperlimit_names
 * 
 */
function renderTable(item,time_flux,time_upperlimits,time_flux_err,flux_names, upperlimit_names){
    let fluxChart = echarts.init(item);
    let flux_option2 = deepCopy(flux_option)
    flux_option2.series[0].data = time_flux
    flux_option2.series[1].data = time_upperlimits
    flux_option2.series[2].data = time_flux_err
    flux_option2.xAxis.data = time_flux.map(item=>item[0])+time_upperlimits.map(item=>item[0])
    flux_option2.tooltip.formatter = function(value) {
        let date = value[0].data[0]
        let data_value = value[0].data[1]
        let date_utc = strftime(convertMJDToDatetime(date))
        
        
        // flux渲染
        if (value[0].seriesName == "flux") {
            let idx = value[0].dataIndex
            let err = (value[1].data[2]-value[1].data[1])/2
            let src_name = flux_names[idx]
            return `
            ${src_name}<br/>
            MJD${date.toFixed(3)}<br/>
            ${date_utc} <br/>
            ${(data_value).toFixed(3)}±${(err).toFixed(3)}
            `
        }
        else if (value[0].seriesName == "upperlimit") {
            idx = value[0].dataIndex
            src_name = upperlimit_names[idx]
            return `
            ${src_name}<br/>
            MJD${date.toFixed(3)}<br/>
            ${date_utc} <br/>
            ${(data_value).toFixed(3)}
            `
        }
    }
    flux_option2&& fluxChart.setOption(flux_option2)
}

