// select the user input field
var userSelect = d3.select("#selDataset");

// select the demographic info div's ul list group
var demographicsTable = d3.select("#demographics-info");

// select the bar chart div
var barChart = d3.select("#bar");

// select the scatter chart div
var scatterChart = d3.select("#scatter");

// json data url
var queryUrl = "http://127.0.0.1:5000/all-data";

// create a function to initially populate dropdown menu with IDs and draw charts by default (using the first neighbourhood)
function init() {

    // reset any previous data
    resetData();

    // read in samples from JSON file
    d3.json(queryUrl).then((data => {
        console.log(data);
        // ----------------------------------
        // POPULATE DROPDOWN MENU WITH NEIGHBOURHOODS 
        // ----------------------------------

        //  use a forEach to loop over each name in the array data.names to populate dropdowns with IDs
        // data.names.forEach((name => {
        //     var option = idSelect.append("option");
        //     option.text(name);
        // })); // close forEach

        // // get the first ID from the list for initial charts as a default
        // var initId = idSelect.property("value")

        // // plot charts with initial ID
        // plotCharts(initId);

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