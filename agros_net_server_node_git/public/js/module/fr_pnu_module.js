var pnuApi = (function () {
    var pnuModule = {};
    
    var fullPnu = null;
    var sidoPnu ={};

    var selSido = null;
    var selSigungu = null;
    var inputPnuId = null;
    var inputPnuCd = null;

    function getSidoPnu() {
        sidoPnu = pnuCode.filter((v,i,a)=>a.findIndex(t=>(t.sido_cd === v.sido_cd))===i);
        return sidoPnu;

    }

    function initSelect() {
        for (let i=0; i<sidoPnu.length; i++) {
            selSido.append("<option value='" + sidoPnu[i].sido_cd + "'>" + sidoPnu[i].sido_nm + "</option>");
        }

        selSido.change(sidoChanged);
        selSigungu.change(sigunguChanged);

        // selSido.find('option:eq(0)').attr('selected', 'selected');
        sidoChanged()
    }

    function sidoChanged() {
        var sigunguPnu = [];
        var sido = selSido.val();

        // console.log('sido changed')

        for (let i=0; i<fullPnu.length; i++) {
            if (sido == fullPnu[i].sido_cd) {
                sigunguPnu.push(fullPnu[i]);
            }
        }
        
        selSigungu.empty();

        for (let i=0; i<sigunguPnu.length; i++) {
            selSigungu.append("<option value='" + sigunguPnu[i].sigungu_cd + "'>" + sigunguPnu[i].sigungu_nm + "</option>");
        }

        sigunguChanged();
    }

    function sigunguChanged() {
        var sidoCode = selSido.val();
        var sigunguCode = selSigungu.val();
        var pnuId = 0;
        var pnuCd = 0;

        // console.log('sigunguChanged - sidoCode : ' + sidoCode + ', sigunguCode : ' + sigunguCode);

        for (let i = 0; i< fullPnu.length; i++) {
            if (sidoCode == fullPnu[i].sido_cd && 
                sigunguCode == fullPnu[i].sigungu_cd) {
                pnuId = fullPnu[i].pnu_id;
                pnuCd = fullPnu[i].pnu_cd;
                break;
            }
        }

        // console.log('selected pnuId : ' + pnuId + ', pnuCd : ' + pnuCd) ;

        if (inputPnuId) {
            inputPnuId.val(pnuId);
        }

        if (inputPnuCd) {
            inputPnuCd.val(pnuCd);
        }
            
    }


    pnuModule.init = function (pnuCode, $sidoSel, $sigunguSel, $pnuId, $pnuCd) {
        // console.log('pnuModule.init');
        console.dir(pnuCode)

        selSido = $sidoSel;
        selSigungu = $sigunguSel;
        inputPnuId = $pnuId;
        inputPnuCd = $pnuCd;

        fullPnu = pnuCode;
        sidoPnu = getSidoPnu();

        initSelect();
        
    }

    pnuModule.setValue = function(pnuCode) {
        // console.log('pnuModule.setValue() - pnuCode : ' + pnuCode);
        // console.dir(fullPnu);

        for (let  i=0; i<fullPnu.length; i++) {
            if (pnuCode == fullPnu[i].pnu_id) {
                // selSido.val(fullPnu[i].sido_nm).attr('selected', 'selected');
                // selSigungu.val(fullPnu[i].sigungu_nm).attr('selected', 'selected');
                // selSido.val(fullPnu[i].sido_cd).prop('selected', true);
                selSido.val(fullPnu[i].sido_cd);
                sidoChanged();
                selSigungu.val(fullPnu[i].sigungu_cd);
                sigunguChanged();
                // selSigungu.val(fullPnu[i].sigungu_cd).prop('selected', true);
                console.log('pnuModule.setValue()  selected! - ' + fullPnu[i].sido_nm + ', ' + fullPnu[i].sigungu_nm);
                return;
            }
        }

        // console.log('pnuModule.setValue() not matched !');
    }

    pnuModule.setPnuCd = function(pnuCode) {
        // console.log('pnuModule.setPnuCd() - pnuCode : ' + pnuCode);
        // console.dir(fullPnu);

        for (let  i=0; i<fullPnu.length; i++) {
            if (pnuCode == fullPnu[i].pnu_cd) {
                // console.log('find PNU : ' + pnuCode + ', index : ' + i);
                // console.dir(fullPnu[i]);
                // selSido.val(fullPnu[i].sido_nm).attr('selected', 'selected');
                // selSigungu.val(fullPnu[i].sigungu_nm).attr('selected', 'selected');
                // selSido.val(fullPnu[i].sido_cd).prop('selected', true);
                // inputPnuCd.val(fullPnu[i].pnu_cd);
                selSido.val(fullPnu[i].sido_cd);
                sidoChanged();
                selSigungu.val(fullPnu[i].sigungu_cd);
                sigunguChanged();
                // sigunguChanged();

                // sigunguChanged();    
                // selSigungu.val(fullPnu[i].sigungu_cd).prop('selected', true);
                // console.log('pnuModule.setValue()  selected! - ' + fullPnu[i].sido_nm + ', ' + fullPnu[i].sigungu_nm);
                return;
            }
        }

        // console.log('pnuModule.setValue() not matched !');
    }





    return pnuModule;
})();