// select the user input field
var userSelect = d3.select("#selDataset");

// select the demographic info div's ul list group
var demographicsTable = d3.select("#demographic-info");

// select the bar chart div
var barChart = d3.select("#bar");

// select the scatter chart div
var scatterChart = d3.select("#scatter");

// json data url
var queryUrl = "http://127.0.0.1:5000/charts";



// create a function to initially populate dropdown menu with IDs and draw charts by default (using the first neighbourhood)
function init() {

    // reset any previous data
    resetData();

    // read in samples from JSON file
    d3.json(queryUrl).then((data => {
        // console.log(data);
        // ----------------------------------
        // POPULATE DROPDOWN MENU WITH NEIGHBOURHOODS 
        // ----------------------------------

        var lookup = {};
        //var items = json.DATA;
        var result = [];

        // for (var item, i = 0; item = items[i++];) {
        //     var name = item.name;

        //     if (!(name in lookup)) {
        //         lookup[name] = 1;
        //         result.push(name);
        //     }
        // }



        //  use a forEach to loop over each name in the array data to populate dropdowns with neighbourhood names
        data.forEach((item => {

            var name = item["Neighbourhood Name"];
            if (!(name in lookup)) {
                lookup[name] = 1;
                result.push(name);

                var option = userSelect.append("option");
                option.text(name);
            }

        })); // close forEach

        // get the first ID from the list for initial charts as a default
        var initNeighbourhood = userSelect.property("value")

        // // plot charts with initial ID
        plotCharts(initNeighbourhood);

    })); // close .then()

} // close init() function

// create a function to reset divs to prepare for new data
function resetData() {

    // ----------------------------------
    // CLEAR THE DATA
    // ----------------------------------

    demographicsTable.html("");
    barChart.html("");
    scatterChart.html("");

}; // close resetData()

init();


// create a function to read JSON and plot charts
function plotCharts(neighbourhood) {
    // ----------------------------------
    // POPULATE DEMOGRAPHICS TABLE
    // ----------------------------------
    // read in the JSON data
    d3.json(queryUrl).then((data => {
        console.log(data);

        // filter the metadata for the ID chosen
        var info = data.filter(item => item["Neighbourhood Name"] == neighbourhood)[0];

        console.log(info);

        // wantedKeys = ["Average age", "Hood_ID", "Population", "Unemployment rate", "household_income", "population_density"];

        var newList = demographicsTable.append("ul");
        newList.attr("class", "list-group list-group-flush");

        // Iterate through each key and value in the item
        Object.entries(info).forEach(([key, value]) => {

            if ((key != "MCI") && (key != "Neighbourhood Name") && (key != "number_of_crime")) {
                // append a li item to the unordered list tag
                var listItem = newList.append("li");

                // change the class attributes of the list item for styling
                listItem.attr("class", "list-group-item p-1 bg-transparent");

                if (key == "Average age") {
                    value = Math.round(value, 2)
                }

                // add the key value pair from the metadata to the demographics list
                listItem.text(`${key}: ${value}`);
            }


        }); // close forEach

        // --------------------------------------------------
        // RETRIEVE DATA FOR PLOTTING CHARTS
        // --------------------------------------------------

        // filter the crimes for the neighbourhood chosen
        var crimeData = data.filter(d => d["Neighbourhood Name"] == neighbourhood);
        //console.log(crimeData);

        var crimes = [];
        var numbers = [];

        for (var i = 0; i < crimeData.length; i++) {
            crimes.push(crimeData[i]["MCI"]);
            numbers.push(crimeData[i]["number_of_crime"]);

        }; // close for 

        // ----------------------------------
        // PLOT BAR CHART
        // ----------------------------------

        // create a trace
        var traceBar = {
            x: numbers,
            y: crimes,
            // text: numbers,
            type: 'bar',
            orientation: 'h',
            marker: {
                color: 'rgb(29,145,192)'
            }
        };

        // create the data array for plotting
        var dataBar = [traceBar];

        // define the plot layout
        var layoutBar = {
            height: 500,
            width: 600,
            font: {
                family: 'Quicksand'
            },
            hoverlabel: {
                font: {
                    family: 'Quicksand'
                }
            },
            title: {
                text: `<b>Top crimes for ${neighbourhood}</b>`,
                font: {
                    size: 18,
                    color: 'rgb(34,94,168)'
                }
            },
            xaxis: {
                title: "<b>Number of Crimes<b>",
                color: 'rgb(34,94,168)'
            },
            yaxis: {
                tickfont: { size: 14 }
            }
        }


        // plot the bar chart to the "bar" div
        Plotly.newPlot("bar", dataBar, layoutBar);


    })); // end d3 .then









}; // end plotCharts function

function optionChanged(neighbourhood) {

    // reset the data
    resetData();

    // plot the charts for this id
    plotCharts(neighbourhood);


} // close optionChanged function