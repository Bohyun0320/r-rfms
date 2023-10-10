function setProgressCircle(elId, val) {
    var $circle = $("#" + elId + " .excd-progress-circle-bar");

    var r = $circle.attr("r");
    var c = Math.PI * (r * 2);

    if (val < 0) { 
        val = 0;
    }
    if (val > 100) {
        val = 100;
    }

    var pct = ((100 - val) / 100) * c;

    console.log('pct : ' + pct);

    $circle.css({ strokeDashoffset: pct });

    $("#" + elId + ' .excd-progress-circle').attr("data-pct", val);
}

function setProgressVisible(elId, isVisible) {
    if (isVisible) {
        $('#' + elId ).removeClass('display-none');
    }else {
        $('#' + elId ).addClass('display-none');
    }
}
