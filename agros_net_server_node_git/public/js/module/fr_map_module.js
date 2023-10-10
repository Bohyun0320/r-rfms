export default class MapModule {
    map = null;
    mapPath = [];
    markerLatLon = null;
    centerInit;

    constructor($container) {
        this.$container = $container;
        this.mapId = "excdMap";
    }

    init() {
        // console.log("map module init()");

        // this.#initPath(pathList);
        // this.#initMarker(latLong)
        this.#initMap();
        this.#initBtns();

        // this.#refreshMap();
    }

    setPath(pathList) {
        if (!pathList || pathList.length < 1) {
            return;
        }

        console.log("setPath");
        console.dir(pathList);

        this.centerInit = new naver.maps.LatLng(
            pathList[0].lat,
            pathList[0].lng
        );

        for (var i = 0; i < pathList.length; i++) {
            this.mapPath.push(
                new naver.maps.LatLng(pathList[i].lat, pathList[i].lng)
            );
        }
    }

    setMarker(latLon) {
        if (!latLon) return;

        this.markerLatLon = latLon;
        this.centerInit = new naver.maps.LatLng(latLon.lat, latLon.long);

        if (this.map) {
            this.marker = new naver.maps.Marker({
                position: this.centerInit,
                map: this.map,
            });
        }
    }

    setGeoJson(geoJson) {
        if (!geoJson) return;

        // console.log("setGeoJson");
        // console.dir(geoJson);

        this.geoJson = this.getDefaultGeoJson();
        this.geoJson.features[0].geometry = geoJson;

        var center = turf.center(geoJson);

        if (center) {
            this.centerInit = new naver.maps.LatLng(
                center.geometry.coordinates[1],
                center.geometry.coordinates[0]
            );
        }

        // console.log('center');
        // console.dir(center);
    }

    getDefaultGeoJson() {
        var obj = {
            type: "FeatureCollection",
            features: [
                {
                    type: "Feature",
                    geometry: null,
                    properties: {
                        text:
                            "default text property",
                    },
                    id: 1,
                },
            ],
        };
        return obj;
    }

    #initMap() {
        var mapOptions = {
            center: this.centerInit,
            zoom: 12,
        };

        if (!this.centerInit) {
            this.centerInit = new naver.maps.LatLng(
                35.17843900000015,
                128.14141610000013
            );
        }

        // console.log("new map");

        this.map = new naver.maps.Map(this.mapId, mapOptions);

        // naver.maps.Event.addListener(this.map, 'size_changed', function(e) {
        //     console.log('size_changed');
        //     console.dir(e);
        // })

        // console.dir(this.mapPath);

        if (this.mapPath.length > 0) {
            var polyline = new naver.maps.Polyline({
                map: this.map,
                path: this.mapPath,
                strokeWeight: 5,
                clickable: true,
                strokeColor: "#FF0000",
                // strokeStyle: 'longdash',
                strokeOpacity: 0.8,
            });
        }

        if (this.markerLatLon) {
            this.marker = new naver.maps.Marker({
                position: this.centerInit,
                map: this.map,
            });
        }

        // console.log("isGeoJson =>");
        // console.dir(this.geoJson);

        if (this.geoJson) {
            this.map.data.addGeoJson(this.geoJson);

            this.map.data.setStyle(function (feature) {
                var color = "red";

                console.log("setStyle");
                console.dir(feature);

                return {
                    fillColor: color,
                    strokeColor: color,
                    strokeWeight: 2,
                    icon: null,
                };
            });
        }
    }

    #initBtns() {
        $("#hide-map").on("click", () => {
            $(".excd-map").addClass("display-none");
        });

        $("#full-map").on("click", () => {
            console.log("full-map");
            $(".excd-map").addClass("excd-map-full");
            $("#full-map").addClass("display-none");
            $("#small-map").removeClass("display-none");

            this.#refreshMap();
        });

        $("#small-map").on("click", () => {
            $(".excd-map").removeClass("excd-map-full");
            $("#small-map").addClass("display-none");
            $("#full-map").removeClass("display-none");
            this.#refreshMap();
        });
    }

    #refreshMap() {
        console.log("refreshMap");

        this.map.autoResize();
    }

    destroyMap() {
        // this.map.destroy();

        // this.map = null;
        this.mapPath = [];
        this.markerLatLon = null;
        this.centerInit = null;
    }
}
