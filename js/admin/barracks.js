var app = angular.module('MA_Barracks', []);

app.controller('SoldiersStopCtrl', ['$scope', '$http', function ($scope, $http) {
    $scope.soldiers = soldiers;
    $scope.activeStopCount = 0;
    $scope.givenStopCount = 0;
    $scope.flag = 1;
    $scope.activeFilter = true;
    $scope.activeCount = 0;
    $scope.inactiveCount = 0;
    $scope.activeStopCount = 0;
    $scope.activeStopCount = 0;
    $scope.givenStopCount = 0;
    
    $scope.formatDate = function(s) {
        return new Date(s).toLocaleString();
    }
    $scope.isGiven = function(st) {
        return st.given || st.dategiven != undefined && st.dategiven != null && st.dategiven != "";
    }

    $scope.getStopClass = function(st) {
        var extraclass = "";
        if ((st.stopname = st.stopname.trim()) == "") {
            st.stopname = '(no name)';
            extraclass += ' noname ';
        }

        if(!st.stopid) {
            extraclass += " nostopid ";
        }
        else if(st.abandoned) {
            extraclass += " abandoned ";
        }
        else if ($scope.isGiven(st)) {
            extraclass += " given ";
        }
        else if (st.type != 'SGN') {
            extraclass += " noteligible ";
        }
        return extraclass;
    };
    $scope.getStopTitle = function(st) {
        var title = st.stopname + "\n" + st.stopid + ' - ' + st.type + " - Given: " + ($scope.isGiven(st) ? "Yes " : " ") + st.dategiven + (st.dateexpire ? " - Expires: " + st.dateexpire : "");
        if (!st.stopid) title += "\nStop ID not populated. Determine Stop ID before printing.";
        else if (st.abandoned) title += "\nAbandonned. Assign to and print from another soldier.";
        else if (st.type != 'SGN') title += "\nShould not print, unless there is a U-channel pole at that location.";    
    
        return title;
    };
    $scope.formatRoutes = function(st) {
        var s = st.routes;
        var result = "";
        if (s) result = s.substr(1, s.length - 2);
        return result;
    }

    // Some preprocessing
    for (var i = 0; i < $scope.soldiers.length; i++) {
        var s = $scope.soldiers[i];
        var nonAbandonedStops = 0;
        for (var j = 0; j < s.stops.length; j++) {
            var st = s.stops[j];
            if (st.abandoned != true) {
                nonAbandonedStops++;
                $scope.activeStopCount++;

                if ($scope.isGiven(st)) {
                    $scope.givenStopCount++;
                }    
            }
        }

        s.isActive = nonAbandonedStops > 0;

        if (s.isActive) $scope.activeCount++;
        else $scope.inactiveCount++;
    }
    
}])

.controller('GtfsManagerCtrl', ['$scope', '$http', function ($scope, $http) {
    var today = new Date();
    var yyyymmdd = today.getFullYear() + "" + ((today.getMonth()+1 < 10 ? "0" : "") + (today.getMonth() + 1)) + "" + (today.getDate() < 10 ? "0" : "") + today.getDate();
    $scope.commands = [
        {
            header: "Update Routes for Adopted Stops",
            description: "Do this BEFORE doing GTFS Update. This will populate the routes in the Stops/Soldiers section.",
            steps: [
                {text: "Update Routes", url: "bus-sign/busdata/MARTA/update-adoptedstop-routes.php"}
            ]
        },
        {
            header: "GTFS Update",
            description: "Download and load the latest MARTA GTFS data. Be sure to update routes for adopted stops before.",
            steps: [
                {text: "Backup existing GTFS tables", url: "bus-sign/busdata/MARTA/updater-backup.php"},
                {text: "Download GTFS data", url: "bus-sign/busdata/MARTA/updater-download.php", params: [
                    {label: "Source:", name: "srcfile", default: "google_transit", after: ".zip"},
                    {label: "Save as:", name: "saveas", default: "gtfs_" + yyyymmdd, after: ".zip"}]
                },
                {text: "Load GTFS data", url: "bus-sign/busdata/MARTA/updater-loaddata.php", params: [
                    {label: "Using file:", name: "srcfile", default: "gtfs_" + yyyymmdd, after: ".zip"}]},
                {text: "Update stop orientation", url: "bus-sign/busdata/MARTA/updater-orientation.php"},
                {text: "Update trip start times", url: "bus-sign/busdata/MARTA/updater-tripstarttime.php"},
                {text: "Update terminus names", url: "bus-sign/busdata/MARTA/updater-terminus.php"}
            ]
        },
        {
            header: "GTFS Rollback",
            description: "Revert to the backed-up version of GTFS in case of issues, or MARTA's real-time feed matches previous GTFS.",
            steps: [
                {text: "Rollback GTFS tables", url: "bus-sign/busdata/MARTA/updater-rollback.php"}
            ]
        }
    ];

    var executeFrom = function(stepSet, index) {
        if (index < stepSet.steps.length) {
            var st = stepSet.steps[index];
            st.isRunning = true;
    
            $http.get(st.url).then(
            function(response) {
                st.isRunning = false;
                st.outcome = response.data;
    
                executeFrom(stepSet, index + 1);
            }, 
            function(response) {
                st.isRunning = false;
                st.outcome = "Step not started (URL failed).";
            });
        }
        else {
            alert("Execution complete.");
        }
    };

    $scope.executeAllSteps = function(stepSet) {
        if (confirm("Click OK to execute " + stepSet.header)) {
            executeFrom(stepSet, 0);
        }
    };

}])

.controller('TerminusManagerCtrl', ['$scope', '$http', function ($scope, $http) {
    $scope.terminii = [];
    $scope.newItem = ["", "", ""];
    $scope.state = {isRunning: false, editedItem: undefined};
    $scope.populate = function() {
        $http.get("../ajax/admin/get-bus-terminus.php").then(
        function(response) {
            $scope.terminii = response.data;
        }, 
        function(response) {
            $scope.errorMsg = "Request failed.";
        });
    };
    $scope.updateName = function(t) {
        var data = {"stop_id": t[0], "stop_name": t[1]};
        var config = {
            headers: {
                "Content-Type": "application/json"
            },
            data: data
        }

        /*$http.post("../ajax/admin/update-bus-terminus.php", data, config).then(
        function(response) {
            t.msg = response.data.status;
        }, 
        function(response) {
            t.msg = "Update request failed";
        });*/
		$.ajax({
            url: "../ajax/admin/update-bus-terminus.php",
            type: "POST",
            data: data,
            dataType: 'json',
            
            success: function(d) {
              switch(d.status) {
              case 'Updated':
                t.msg = d.status;
                $scope.$apply();
                break; 
              default:
                    t.msg = "Update request failed";
                    console.log(d);
              }
          },
          error: function(jqXHR, textStatus, errorThrown) {
              console.log(textStatus, errorThrown);
              t.msg = "Update request failed";
            }});

        $scope.state.editedItem = undefined;

      }
}])

;