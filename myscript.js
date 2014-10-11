
    /*****************************
        Author: Subhendu Saha
        File Created on 4/13/2014
     *****************************/

    google.load('visualization', '1', { 'packages': ['geochart'] });
    google.setOnLoadCallback(drawMap);

    /* set this value to the <APP URL> path */
    /* Don't use trailing / character */

    var appUrl = "http://localhost:8084";

    var index = 0;
    var error = 0; /* error flag */

    var stack = new Array();
    stack.push('world');

    var level = new Array();
    level.push('continents')
    level.push('subcontinents');
    level.push('countries');
    level.push('provinces');

    var data;
    var options = {
        width:900,
        keepAspectRation: true,
        colorAxis: {minValue:0,
                colors:[
                '#FFC26B',
                '#FFAF3B',
                '#FF9700',
                '#C1852F',
                '#A86400']},
        backgroundColor:'#B0E2FF',
        datalessRegionColor:'#FAFAFA'
    };

    function drawMap(){
        var queryString;
        if(index == 0){
            queryString = "*";
            $('#label').text('Current Level: world');
        }else{
            queryString = stack[index];
        }
        var jsonData = $.ajax({
            url:appUrl+"/data/getTrends.jsp?q="+queryString,
            dataType:"json",
            async:false,
            error:function(){
                error = 1;
            }
        }).responseText;
        if(index!=0){
            $('#error').text("");
        }
        var dataTbl = new google.visualization.DataTable();
        dataTbl.addColumn('string','RegionCode');
        dataTbl.addColumn('number','DisplayValue');
        if(error == 0){
            data = google.visualization.arrayToDataTable(jsonData,true);
            alert(data);
            for(var i=0;i<data.getNumberOfRows;i++){
                dataTbl.addRow(data[i]);
            }
        }
        options['region'] = stack[index];
        options['resolution'] = level[index];

        var geochart = new google.visualization.GeoChart(document.getElementById('map-canvas'));
        geochart.draw(dataTbl,options);

        google.visualization.events.addListener(geochart,'regionClick',function(eventData){
            if(index < 3){
                index++;
                stack.push(eventData.region);

                queryString = stack[index];

                var jsonData = $.ajax({
                    url:appUrl+"/data/getTrends.jsp?q="+queryString,
                    dataType:'json',
                    async:false,
                    error:function(){
                        error = 1;
                    }
                }).responseText;

                var dataTbl = new google.visualization.DataTable();
                dataTbl.addColumn('string','RegionCode');
                dataTbl.addColumn('number','DisplayValue');

                if(error == 0){
                    data = google.visualization.arrayToDataTable(jsonData,true);
                    for(var i=0;i<data.getNumberOfRows;i++){
                        dataTbl.addRow(data[i]);
                    }
                }
                /*
                dataTbl.addRow(['NY',100]);
                dataTbl.addRow(['AZ',50]);
                dataTbl.addRow(['TX',12]);
                dataTbl.addRow(['MI',120]);
                */
                options['region'] = stack[index];
                options['resolution'] = level[index];

                geochart.draw(dataTbl,options);
                google.visualization.events.addListener(geochart,'error',function(){
                    $('#error').text("Chart doesn't exist");
                    index--;
                    stack.pop();
                    drawMap();
                });

                $('#label').text('Current Level: '+level[index]);
                $('#error').text("");
            }
            else{
                $('#error').text('Cannot go further down');
            }
        });
    }

    function goBack(){
        if(index == 0){
            $('#error').text('Cannot go further up');
            //drawMap();
        }else{
            index--;
            stack.pop();
            $('#label').text('Current Level: '+level[index]);
            drawMap();
        }
    }