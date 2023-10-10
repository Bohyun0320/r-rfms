// var gChartContainerWidth;
// var gChartWidth;
// var gChartHeight;

// var chartBsnsBySptTy = null;
// var chartInspBySptTy = null;
// var chartInspByMonth = null;
// var chartInspByBsns = null;
// var chartInspRateByBsns = null;

// var gChart =[];

// var theme = {
//   series: {
//     series: {
//       colors: [
//         '#83b14e', '#458a3f', '#295ba0', '#2a4175', '#289399',
//         '#289399', '#617178', '#8a9a9a', '#516f7d', '#dddddd'
//       ]
//     },
//     label: {
//       color: '#fff',
//       fontFamily: 'sans-serif'

// //      'Noto Sans KR', "나눔고딕", 'NanumGothic', "Nanum Gothic","돋움", 'Dotum', 'Poppins', 'Arial', 'sans-serif'
//     }
//   }
// };

let startDatePicker;
let endDatePicker;

$(document).ready(function ($) {
    // calcChartUI();
    // refreshChartUi();

    // tui.chart.registerTheme('myTheme', theme);
    tui.usageStatistics = false;
    initDatePicker();

    reqTotalData();
    reqPrjStat();
    reqDataPeriod();
    reqEquipStat();
    reqObjStat();


    // initOverview();
    // initChart1();
    // initChart2();
    // initChart3();
    // initChart4();
    //  initChart5();
    //  initChart6();

    // requestAllChart();
    // initFilter();

    $(window).resize(function () {
        //    console.log('resize...')

        calcChartUI();
        refreshChartUi();
    })
});

function initDatePicker() {
    var today = new Date();
    var lastYear = new Date();

    lastYear.setFullYear(lastYear.getFullYear() - 1);

    startDatePicker = new tui.DatePicker('#stat-start-date-picker-container', {
        date: lastYear,
        input: {
            element: '#start-date',
            format: 'yyyy-MM-dd'
        },
        language: 'ko',
    });

    endDatePicker = new tui.DatePicker('#stat-end-date-picker-container', {
        date: today,
        input: {
            element: '#end-date',
            format: 'yyyy-MM-dd'
        },
        language: 'ko',
    });

}

function countAni(elId, value, unit, drt) {
    $({ val : 0 }).animate({ val : value }, {
        duration: drt ? drt : 1000,
        step: function() {
          var num = numberWithCommas(Math.floor(this.val));
          $("#" + elId).text(num + (unit ? ' ' + unit : ''));
        },
        complete: function() {
          var num = numberWithCommas(Math.floor(this.val));
          $("#" + elId).text(num + (unit ? ' ' + unit : ''));
        }
      });
}

function numberWithCommas(x) {
    if (isNaN(x)) return 0;

    return x.toLocaleString();
}


function ajaxError(result) {
    console.dir(result);
    runToastr('error', result.msg);
}

function reqTotalData() {
    $.ajax({
        url: '/api/stat/data-total',
        type: 'GET',
        dataType: 'JSON',
        success: setTotalData,
        err: ajaxError
    });
}

function setTotalData(result) {
    // $('#dataCamCount').html(result.data.camDataCount.toLocaleString() + ' 건');
    // $('#dataLidarCount').html(result.data.lidatDataCount.toLocaleString() + ' 건');
    // $('#dataObjCount').html(result.data.dataObjDbCount.toLocaleString() + ' 건');

    countAni('dataCamCount', result.data.camDataCount, '건');
    countAni('dataLidarCount', result.data.lidatDataCount, '건');
    countAni('dataObjCount', result.data.dataObjDbCount, '건');
}

function reqPrjStat() {
    $.ajax({
        url: '/api/stat/prj-status',
        type: 'GET',
        dataType: 'JSON',
        success: setPrjStat,
        err: ajaxError
    });
}

function setPrjStat(result) {
    // console.dir(result);

    let totalCount = 0;

    for (let i = 0; i < result.data.length; i++) {
        totalCount += result.data[i].count;

        switch (result.data[i].prj_stts_cd) {
            case 1: 
                // $('#prjAcq').html(result.data[i].count.toLocaleString() + ' 건');
                countAni('prjAcq', result.data[i].count, '개', 500);
                break;

            case 2: 
                // $('#prjAcqCmpt').html(result.data[i].count.toLocaleString() + ' 건');
                countAni('prjAcqCmpt', result.data[i].count, '개', 500);
                break;
                
                case 3: 
                // $('#prjPrcs').html(result.data[i].count.toLocaleString() + ' 건');
                countAni('prjPrcs', result.data[i].count, '개', 500);
                break;
                
                case 4: 
                // $('#prjPrcsCmpt').html(result.data[i].count.toLocaleString() + ' 건');
                countAni('prjPrcsCmpt', result.data[i].count, '개', 500);
                break;
            
            default:
                console.log('invalid value : ' + result.data[i].prj_stts_cd);
                break;
        }
    }
    // console.log(totalCount);

    countAni('prjTotalCount', totalCount, '개', 500);
}

function reqDataPeriod() {
    let queryStr = '?startDt=' + $('input[name="start_date"]').val() +
                    '&endDt=' + $('input[name="end_date"]').val() +
                    '&setp=' + $('select[name="date-step"]').val()

    // console.log(queryStr);

    $.ajax({
        url: '/api/stat/data-period' + queryStr,
        type: 'GET',
        dataType: 'JSON',
        success: setPrjStatChart,
        err: ajaxError
    });
}

function setPrjStatChart(result) {
    // console.dir(result);

    if (result.data.length < 2) {
        console.log('length : ' + result.data.length);
        return alert('잘못된 기간 입력 입니다.');
    }

    var container = document.getElementById("chartDataPeriod");

    var chartWidth = $('#chartDataPeriod').width();

    $('#chartDataPeriod').empty();

    let chartData = {
        categories : [],
        series: [
            {
                name: "데이터 획득 건수",
                // data: [0, 0, 0, 0, 0, 1, 0, 0, 2, 5, 2, 0, 0],
                data: [],
            },
        ],
        // xAxis : {
        //     date : true
        // }
    };

    let labelInterval = 1;
    
    if (result.data.length > 20) {
        labelInterval = Math.round(result.data.length / 30);
        console.log('labelInterval : ' + labelInterval  );
    }

    for (let i=0; i < result.data.length; i++) {
        // if (i % step != 0 ) {
        //     continue;
        // }

        chartData.categories.push(result.data[i].tdate);
        chartData.series[0].data.push(result.data[i].count ? result.data[i].count : 0);

        // console.log('added : ' + chartData.categories.length );
    }

    // console.dir(chartData);

    var options = {
        chart: {
            title: "영상데이터 획득 건수",
            width: chartWidth
        },
        yAxis: {
            //  title: '검사 건수',
            pointOnColumn: true,
        },
        xAxis: {
            //          title: '월',
            // type: 'datetime',
            // dateFormat: 'MM',
            // suffix : '월',
            labelMargin: 30,
            labelInterval: labelInterval,

            // tickInterval: 'auto'
        },
        series: {
            showDot: labelInterval == 1 ? true : false,
            zoomable: true,
            lineWidth: 1,
            pointWidth : labelInterval == 1 ? undefined : 1
        },
        tooltip: {
            // grouped: true,
            suffix: "건",
        },
        legend: {
            visible: false,
            // align : 'top'
        },
        // theme: {
        //     series: {
        //         lineWidth : 1
        //     }
        // }  
    };

    chartPrjStts = tui.chart.lineChart(container, chartData, options);
}

function reqEquipStat() {
    $.ajax({
        url: '/api/stat/equip',
        type: 'GET',
        dataType: 'JSON',
        success: setEquipStat,
        err: ajaxError
    });
}

function setEquipStat(result) {
    // console.dir(result);

    countAni('equipCarCnt', result.data.vehicle ? result.data.vehicle : 0);
    countAni('equipSensCnt', result.data.sensor ? result.data.sensor : 0);

    // $('#equipCarCnt').html(result.data.vehicle ? result.data.vehicle : 0);
    // $('#equipSensCnt').html(result.data.sensor ? result.data.vehicle : 0);
}

function reqObjStat() {
    $.ajax({
        url: '/api/stat/object',
        type: 'GET',
        dataType: 'JSON',
        success: setObjChart,
        err: ajaxError
    });
}

function setObjChart(result) {
    // console.dir(result.data);

    var container = document.getElementById("chartObj");

    var chartWidth = $('#chartObjData').width();

    $('#chartObj').empty();

    let chartData = {
        categories : [],
        series: [
            {
                name: "객체데이터",
                data: [],
            },
        ],
    };

    for (let i=0; i < result.data.length; i++) {
        chartData.categories.push(result.data[i].sign_nm);
        chartData.series[0].data.push(result.data[i].count ? result.data[i].count : 0);
    }

    var options = {
        chart: {
            title: "종류별 객체 현황",
            width: chartWidth
        },
        yAxis: {
            pointOnColumn: true,
        },
        xAxis: {
            labelMargin: 10,
        },
        series: {
            // showDot: true,
            // zoomable: true,
        },
        tooltip: {
            // grouped: true,
            suffix: "개",
        },
        legend: {
            visible: false,
            // align : 'top'
        },
    };

    chartObjStts = tui.chart.columnChart(container, chartData, options);

}



function calcChartUI() {
    var dashboardWidth = $(".dashboard-main").width();
    var colNo = 3;

    if (dashboardWidth < 1220) {
        colNo = 2;
    }

    gChartContainerWidth = dashboardWidth / colNo - 30;
    gChartWidth = gChartContainerWidth - 22;
    gChartHeight = (gChartWidth * 3) / 4;
}

function refreshChartUi() {
    $(".chart-container").css("width", gChartContainerWidth);
    $(".chart-container").css("height", (gChartContainerWidth * 3) / 4);

    // if (chartBsnsBySptTy)
    //     chartBsnsBySptTy.resize({ width: gChartWidth, height: gChartHeight });
    // if (chartInspBySptTy)
    //     chartInspBySptTy.resize({ width: gChartWidth, height: gChartHeight });
    // if (chartInspByMonth)
    //     chartInspByMonth.resize({ width: gChartWidth, height: gChartHeight });
    // if (chartInspByBsns)
    //     chartInspByBsns.resize({ width: gChartWidth, height: gChartHeight });
    // if (chartInspRateByBsns)
    //     chartInspRateByBsns.resize({
    //         width: gChartWidth,
    //         height: gChartHeight,
    //     });
}

// function initChart1() {
//     var container = document.getElementById("chart1");
//     var chartData = {
//         categories: [
//             "data1",
//             "data2",
//             "data3",
//             "data4",
//             "data5",
//             "data6",
//             "data7",
//             "data8",
//             "data9",
//             "data10",
//             "data11",
//             "data12",
//             "data13",
//         ],
//         series: [
//             {
//                 name: "내부",
//                 data: [
//                     0,
//                     "2.237",
//                     "77.037",
//                     0,
//                     0,
//                     "77.037",
//                     0,
//                     0,
//                     "79.274",
//                     0,
//                     0,
//                     0,
//                     0,
//                 ],
//             },
//             {
//                 name: "외부",
//                 data: [0, "2.824", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//             },
//         ],
//     };

//     var options = {
//         chart: {
//             // width: gChartContainerHalfWidth - 20,
//             // height:chartHeight,
//             title: "완료 면적 (㎢)",
//             format: "1,000",
//         },
//         yAxis: {
//             title: "대상공간정보",
//             align: "center",

//             // min: 0,
//             //          max: 9000
//         },
//         legend: {
//             align: "top",
//         },
//         series: {
//             diverging: true,
//         },
//     };

//     chartInspSumm = tui.chart.barChart(container, chartData, options);
// }

// function initChart2() {
//     var container = document.getElementById("chart2");

//     // console.dir(data);

//     var options = {
//         chart: {
//             title: "chart 2 ",
//         },
//         series: {
//             //      showLegend: true,
//             showLabel: true,
//             labelAlign: "center",
//         },
//         legend: {
//             visible: true,
//         },
//         tooltip: {
//             suffix: "건",
//         },
//     };

//     var data = {
//         categories: ["Browser"],
//         series: [
//             {
//                 name: "data1",
//                 data: "3",
//             },
//             {
//                 name: "data2",
//                 data: "1",
//             },
//             {
//                 name: "data3",
//                 data: "1",
//             },
//             {
//                 name: "data4",
//                 data: "2",
//             },
//             {
//                 name: "data5",
//                 data: "2",
//             },
//             {
//                 name: "data6",
//                 data: "1",
//             },
//         ],
//     };

//     // For apply theme
//     // options.theme = "myTheme";

//     chartBsnsBySptTy = tui.chart.pieChart(container, data, options);
// }

// function initChart3() {
//     var container = document.getElementById("chart3");

//     var options = {
//         chart: {
//             title: "완료 건수",
//         },
//         yAxis: {
//             //  title: '검사 건수',
//             pointOnColumn: true,
//         },
//         xAxis: {
//             //          title: '월',
//             // type: 'datetime',
//             // dateFormat: 'MM',
//             // suffix : '월',
//             labelMargin: 10,
//         },
//         series: {
//             showDot: true,
//             zoomable: true,
//         },
//         tooltip: {
//             // grouped: true,
//             suffix: "건",
//         },
//         legend: {
//             visible: false,
//             // align : 'top'
//         },
//     };

//     var data = {
//         categories: [
//             "2021년 12월",
//             "2022년 01월",
//             "2022년 02월",
//             "2022년 03월",
//             "2022년 04월",
//             "2022년 05월",
//             "2022년 06월",
//             "2022년 07월",
//             "2022년 08월",
//             "2022년 09월",
//             "2022년 10월",
//             "2022년 11월",
//             "2022년 12월",
//         ],
//         series: [
//             {
//                 name: "완료 사업건수",
//                 data: [0, 0, 0, 0, 0, 1, 0, 0, 2, 5, 2, 0, 0],
//             },
//         ],
//     };

//     chartBsnsEnd = tui.chart.lineChart(container, data, options);
// }

// function initChart4() {
//     container = document.getElementById("chart4");

//     var options = {
//         chart: {
//             height: $("#scrtdb_summ").height(),
//             title: "업데이트 건수",
//         },
//         series: {
//             // stackType: 'normal',
//             stackType: "normal",
//             showLabel: false,
//             showLegend: false,
//         },
//         legend: {
//             align: "top",
//         },
//     };

//     var chartData = {
//         categories: [
//             "2021년 12월",
//             "2022년 01월",
//             "2022년 02월",
//             "2022년 03월",
//             "2022년 04월",
//             "2022년 05월",
//             "2022년 06월",
//             "2022년 07월",
//             "2022년 08월",
//             "2022년 09월",
//             "2022년 10월",
//             "2022년 11월",
//             "2022년 12월",
//         ],
//         series: [
//             {
//                 name: "추가",
//                 data: [0, 0, 0, 0, 0, "11", 0, 0, 0, 0, 0, 0, 0],
//             },
//             {
//                 name: "수정",
//                 data: [0, 0, 0, 0, 0, "2", 0, "2", 0, 0, 0, 0, 0],
//             },
//             {
//                 name: "삭제",
//                 data: [0, 0, 0, 0, 0, "5", 0, 0, 0, "1", 0, 0, 0],
//             },
//         ],
//     };
//     chartScrtChg = tui.chart.columnChart(container, chartData, options);
// }
