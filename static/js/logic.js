// select the modal title 
var modalHeader = d3.select("#modal-heading");

// select the demographic info div's ul list group
var demographicsTable = d3.select("#demographic-info");

// select the bar chart div
var barChart = d3.select("#bar");

// select the scatter chart div
var scatterChart = d3.select("#scatter");

// json data url
var queryUrl = "http://127.0.0.1:5000/charts";


// create a function to reset divs to prepare for new data
function resetData() {

    // ----------------------------------
    // CLEAR THE DATA
    // ----------------------------------

    demographicsTable.html("");
    barChart.html("");
    scatterChart.html("");

}; // close resetData()

// create a function to take in parameter from clicked neighbourhood, read JSON and plot charts
function plotCharts(neighbourhood) {

    // reset previous data
    resetData();

    // ----------------------------------
    // POPULATE DEMOGRAPHICS TABLE
    // ----------------------------------

    // read in the JSON data
    d3.json(queryUrl).then((data => {

        // filter the information for the neighbourhood chosen
        var info = data.filter(item => item["Neighbourhood Name"] == neighbourhood)[0];

        // update the heading in the modal popup with neighbourhood name
        modalHeader.html(`Neighbourhood: ${neighbourhood}`);

        // create a new UL element in the demographics div
        var newList = demographicsTable.append("ul")
            .attr("class", "list-group list-group-flush");

        // Iterate through each key and value in the demographics info
        Object.entries(info).forEach(([key, value]) => {

            // conditional statement to not include the three keys below
            if ((key != "MCI") && (key != "Neighbourhood Name") && (key != "number_of_crime")) {

                // append a li item to the unordered list tag
                var listItem = newList.append("li");

                // change the class attributes of the list item for styling
                listItem.attr("class", "list-group-item p-1 bg-transparent");

                // round the average age
                if (key == "Average age") {
                    value = Math.round((value * 100) / 100)
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
            height: 400,
            width: 500,
            margin: {
                l: 100,
                r: 5,
                b: 70,
                t: 50,
                pad: 2
            },
            font: {
                family: 'Roboto'
            },
            hoverlabel: {
                font: {
                    family: 'Roboto'
                }
            },
            title: {
                text: `<b>Top crimes</b>`,
                font: {
                    size: 18,
                    color: 'Black'
                }
            },
            xaxis: {
                title: "<b>Number of Crimes<b>",
                color: 'rgb(34,94,168)'
            },
            yaxis: {
                tickfont: { size: 12 }
            }
        }

        // plot the bar chart to the "bar" div
        Plotly.newPlot("bar", dataBar, layoutBar);


    })); // end d3 .then


}; // end plotCharts function