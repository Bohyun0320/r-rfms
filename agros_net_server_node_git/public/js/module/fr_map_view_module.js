export default class MapViewModule{

    map = null;
    centerInit;
    markers = [];
    bounds;

    constructor($container){
        this.$container = $container;
        this.mapId = "geoMap";
    }

    init(){
        this.#initMap();
        console.log("MapViewModule init()");

        return this.map;
    }

    #initMap(){
        var mapOptions ={
            center: this.centerInit,
            zoom:12,
            zoomControl: true,
            zoomControlOptions:{
                position: naver.maps.Position.TOP_LEFT,
                style: naver.maps.ZoomControlStyle.SMALL
            }
        };

        if(!this.centerInit){
            this.centerInit = new naver.maps.LatLng(
                35.17843900000015,
                128.14141610000013
            );
        }

        this.map = new naver.maps.Map(this.mapId, mapOptions);
    } 


    setMarker(map, data){
        console.log("fr_map_view_module - setMarker()");

        this.bounds = new naver.maps.LatLngBounds();

        for(var i = 0; i<data.length; i++){
            
            // var contentString = [
            //     '<div style="width:400px; padding:10px;">',
            //     '<h4>프로젝트 번호 : ',
            //     data[i]['prj_id']
            //     ,'</h4>',
            //     '<p>프로젝트명 : ', data[i]['prj_nm'],'</p>',
            //     '<p>표지판 분류 : ',data[i]['trffc_sign_ty_nm'],'</p>',
            //     '<p>객체명 : ',data[i]['sign_nm'],'</p>',
            //     '</div>'
            // ].join('');
            
            // var infowindow = new naver.maps.InfoWindow({
            //     content: contentString,
            //     backgroundColor: "rgba(255, 255, 255, 0.9)", // 배경색
            //     borderColor: "#ff9900", // 테두리 색상
            //     borderWidth: 2, // 테두리 두께
            //     anchorColor: "#ff9900", // 화살표 색상
            //     anchorSize: new naver.maps.Size(10, 10), // 화살표 크기
            //     pixelOffset: new naver.maps.Point(0, -10) // 화살표 위치 조정
            // });

            if(data[i]['sign_ty_id']==1){
                this.markers[i] = new naver.maps.Marker({
                    position: new naver.maps.LatLng(data[i]['navery'], data[i]['naverx']),
                    map: this.map,
                    icon: {
                        url : "/public/images/marker/marker_1.png",
                        size: new naver.maps.Size(40,42),
                        scaledSize: new naver.maps.Size(40,42),
                        origin: new naver.maps.Point(0,0),
                        anchor: new naver.maps.Point(25,26)
                    }
                });
            }else if(data[i]['sign_ty_id']==2){
                this.markers[i] = new naver.maps.Marker({
                    position: new naver.maps.LatLng(data[i]['navery'], data[i]['naverx']),
                    map: this.map,
                    icon: {
                        url : "/public/images/marker/marker_2.png",
                        size: new naver.maps.Size(40,42),
                        scaledSize: new naver.maps.Size(40,42),
                        origin: new naver.maps.Point(0,0),
                        anchor: new naver.maps.Point(25,26)
                    }
                });

            }else if(data[i]['sign_ty_id']==3){
                this.markers[i] =  new naver.maps.Marker({
                    position: new naver.maps.LatLng(data[i]['navery'], data[i]['naverx']),
                    map: this.map,
                    icon: {
                        url : "/public/images/marker/marker_3.png",
                        size: new naver.maps.Size(40,42),
                        scaledSize: new naver.maps.Size(40,42),
                        origin: new naver.maps.Point(0,0),
                        anchor: new naver.maps.Point(25,26)
                    }
                });
            }else if(data[i]['sign_ty_id']==7){
                this.markers[i] =  new naver.maps.Marker({
                    position: new naver.maps.LatLng(data[i]['navery'], data[i]['naverx']),
                    map: this.map,
                    icon: {
                        url : "/public/images/marker/marker_4.png",
                        size: new naver.maps.Size(40,42),
                        scaledSize: new naver.maps.Size(40,42),
                        origin: new naver.maps.Point(0,0),
                        anchor: new naver.maps.Point(25,26)
                    }
                });
            }else if(data[i]['sign_ty_id']==8){
                this.markers[i] =  new naver.maps.Marker({
                    position: new naver.maps.LatLng(data[i]['navery'], data[i]['naverx']),
                    map: this.map,
                    icon: {
                        url : "/public/images/marker/marker_4.png",
                        size: new naver.maps.Size(40,42),
                        scaledSize: new naver.maps.Size(40,42),
                        origin: new naver.maps.Point(0,0),
                        anchor: new naver.maps.Point(25,26)
                    }
                });
            }

            // naver.maps.Event.addListener(this.markers[i], "click", (function(infowindow, marker){
            //     return function(){
            //         if(infowindow.getMap()){
            //             infowindow.close();
            //         }else{
            //             infowindow.open(map, marker);
            //         }
            //     };
            // })(infowindow, this.markers[i]));

            // naver.maps.Event.addListener(this.markers[i], "dblclick", function(){
            //     console.log("dblclick Event");
            //     this.#clickEvent();
            // });

            this.bounds.extend(naver.maps.LatLng(data[i]['navery'], data[i]['naverx']));
        };
    }

    removeMarker(){
        console.log("removeMarker() - markerNum : "+this.markers.length);
        if(this.markers.length != 0){
            for(var i = 0; i<this.markers.length; i++){
                this.markers[i].setMap(null);
            }
        }
    }

    setBounds(){
        this.map.fitBounds(this.bounds);
    }

    #clickEvent(){
        console.log("clickEvent()");
    }

}