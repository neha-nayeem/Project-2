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

        // sort the array to get the top crime numbers in ascending order
        var sortedNumbers = numbers.sort(d3.ascending);
        console.log(sortedNumbers);

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


function makeResponsive() {

    // Select the SVG area
    var svgArea = d3.select("#scatter").select("svg");
    //console.log(svgArea);

    // if the SVG area isn't empty when the browser loads,
    // remove it and replace it with a resized version of the chart
    if (!svgArea.empty()) {
        svgArea.remove();
    }

    // Set up the chart
    // ================================

    // SVG dimensions
    var svgWidth = window.innerWidth;
    var svgHeight = window.innerHeight / 1.5;

    // Margins
    var margin = {
        top: 50,
        right: 110,
        bottom: 120,
        left: 150
    };

    // Chart dimensions
    var chartWidth = svgWidth - margin.left - margin.right;
    var chartHeight = svgHeight - margin.top - margin.bottom;

    // Create svg container
    var svg = d3.select("#scatter")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    // Append a chart group to the SVG and move it to the top left 
    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Import data from the data.csv file
    // =================================

    d3.json(queryUrl).then(data => {
        //console.log(data);

        var neighbourhoodList = Array.from(new Set(data.map(d => d["Neighbourhood Name"])));

        var neighbourhoodCrimes = [];

        for (var i = 0; i < neighbourhoodList.length; i++) {
            var name = neighbourhoodList[i];

            var element = {};

            element["Neighbourhood"] = name;

            for (var j = 0; j < data.length; j++) {


                if ((data[j]["Neighbourhood Name"] == name)) {
                    var crime = data[j]["MCI"];
                    var num = data[j]["number_of_crime"];
                    element[crime] = num;

                    // get the rest of the info for each neighbourhood, parsing into numerical if needed
                    element["age"] = +data[j]["Average age"];
                    element["hoodID"] = +data[j]["Hood_ID"];
                    element["population"] = +data[j]["Population"];
                    element["unemployment"] = +data[j]["Unemployment rate"];
                    element["income"] = +data[j]["household_income"];
                    element["populationDensity"] = +data[j]["population_density"];

                    neighbourhoodCrimes.push(element);
                }; // if
            }; // second for
        }; // first for

        var uniqueArray = getUniqueArray(neighbourhoodCrimes);
        //console.log(uniqueArray);

        // Initial chart x,y parameters
        // ============================================

        var xAxisFactor = "age";
        var yAxisFactor = "Assault";

        // Create x,y scales
        // ============================================

        var xScale = d3.scaleLinear().range([0, chartWidth]);
        var yScale = d3.scaleLinear().range([chartHeight, 0]);

        xScale.domain(domainX(uniqueArray, xAxisFactor));
        yScale.domain(domainY(uniqueArray, yAxisFactor));


        // Create Axes
        // =============================================

        var bottomAxis = d3.axisBottom(xScale);
        var leftAxis = d3.axisLeft(yScale);

        // Append the axes to the chartGroup
        // ==============================================

        var xAxis = chartGroup.append("g")
            .attr("transform", `translate(0, ${chartHeight})`)
            .call(bottomAxis);

        var yAxis = chartGroup.append("g")
            .call(leftAxis);

        // Create labels for x,y axes
        // ==============================

        var yAxesLabels = chartGroup.append("g");
        var xAxesLabels = chartGroup.append("g");

        // All yaxis labels
        var assault = yAxesLabels.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", margin.top - chartHeight / 2 - 20)
            .attr("y", 115 - margin.left)
            .attr("class", "aText active yaxis-label")
            .attr("value", "Assault")
            .text("Assault");

        var robbery = yAxesLabels.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", margin.top - chartHeight / 2 - 20)
            .attr("y", 90 - margin.left)
            .attr("class", "aText inactive yaxis-label")
            .attr("value", "Robbery")
            .text("Robbery");

        var breakenter = yAxesLabels.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", margin.top - chartHeight / 2 - 20)
            .attr("y", 65 - margin.left)
            .attr("class", "aText inactive yaxis-label")
            .attr("value", "Break and Enter")
            .text("Break and Enter");

        // All xaxis labels
        var age = xAxesLabels.append("text")
            .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + margin.top - 10})`)
            .attr("class", "aText active xaxis-label")
            .attr("value", "age")
            .text("Age (Average)");

        var income = xAxesLabels.append("text")
            .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + margin.top + 15})`)
            .attr("class", "aText inactive xaxis-label")
            .attr("value", "income")
            .text("Household Income (Average)");

        var unemployment = xAxesLabels.append("text")
            .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + margin.top + 40})`)
            .attr("class", "aText inactive xaxis-label")
            .attr("value", "unemployment")
            .text("Unemployment Rate (%)");

        // Append circles to data points
        // ===============================
        var circlesGroup = chartGroup.append("g")
            .selectAll("circle")
            .data(uniqueArray)
            .enter()
            .append("circle")
            .attr("cx", d => xScale(d[xAxisFactor]))
            .attr("cy", d => yScale(d[yAxisFactor]))
            .attr("r", "10")
            .attr("opacity", "0.6")
            .classed("nCircle", true);

        // Hood ID labels in circles
        // ========================= 
        var idLabels = chartGroup.append("g")
            .selectAll("text")
            .data(uniqueArray)
            .enter()
            .append("text")
            .attr("x", d => xScale(d[xAxisFactor]))
            .attr("y", d => yScale(d[yAxisFactor]) + 3.5)
            .classed("nText", true)
            .text(d => d.hoodID);

        // Call the updateTooltip function to create toolTip
        // ====================================================
        updateTooltip(xAxisFactor, yAxisFactor, circlesGroup, idLabels);


        // Event listeners for axes changes
        // =================================

        // on clicking X axis labels
        xAxesLabels.selectAll("text").on("click", function() {

            // Store the value clicked
            var xAxisValue = d3.select(this).attr("value");

            // If the value is different from the the one drawn by default
            if (xAxisValue !== xAxisFactor) {

                // Assign new value to xAxisFactor
                xAxisFactor = xAxisValue;

                // Create new xScale domain
                xScale.domain(domainX(uniqueArray, xAxisFactor));

                // Update xAxis with new scale
                updateXAxis(xScale, xAxis);

                // Update circles, id labels and tooltip
                updatePlot(circlesGroup, idLabels, xScale, yScale, xAxisFactor, yAxisFactor);
                updateTooltip(xAxisFactor, yAxisFactor, circlesGroup, idLabels);
            }


            // switch statement to update clicked label to active and others to inactive
            switch (xAxisFactor) {
                case "age":
                    age.attr("class", "active");
                    income.attr("class", "inactive");
                    unemployment.attr("class", "inactive");
                    break;
                case "income":
                    income.attr("class", "active");
                    age.attr("class", "inactive");
                    unemployment.attr("class", "inactive");
                    break;
                case "unemployment":
                    unemployment.attr("class", "active");
                    age.attr("class", "inactive");
                    income.attr("class", "inactive");
                    break;
                default:
                    break;
            }; // switch statement

        }); // close "on click" function for x axis

        // on clicking Y axis labels
        yAxesLabels.selectAll("text").on("click", function() {

            // Store the value clicked           
            var yAxisValue = d3.select(this).attr("value");
            console.log(yAxisValue);

            // If the value is different from the one drawn by default
            if (yAxisValue !== yAxisFactor) {

                // Assign new value to yAxisFactor
                yAxisFactor = yAxisValue;

                // Create new yScale domain
                yScale.domain(domainY(uniqueArray, yAxisFactor));

                // Update yAxis with new scale
                updateYAxis(yScale, yAxis);

                // update circles, id labels and tooltip
                updatePlot(circlesGroup, idLabels, xScale, yScale, xAxisFactor, yAxisFactor);
                updateTooltip(xAxisFactor, yAxisFactor, circlesGroup, idLabels);

                // switch statement to update clicked label to active and others to inactive
                switch (yAxisFactor) {
                    case "Assault":
                        assault.attr("class", "active");
                        robbery.attr("class", "inactive");
                        breakenter.attr("class", "inactive");
                        break;
                    case "Robbery":
                        robbery.attr("class", "active");
                        assault.attr("class", "inactive");
                        breakenter.attr("class", "inactive");
                        break;
                    case "Break and Enter":
                        breakenter.attr("class", "active");
                        assault.attr("class", "inactive");
                        robbery.attr("class", "inactive");
                        break;
                    default:
                        break;
                }; // switch statement

            }; // if statement

        }); // close "on click" function for y axis       


    });

}; // close makeResponsive() 


makeResponsive();
// Event listener for window resize.
// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);

// define a function to create a unique array of objects
// source: https://medium.com/@jithinsebastian2/remove-duplicate-objects-from-an-array-of-objects-javascript-es6-9d36f705d376
function getUniqueArray(arr = [], compareProps = []) {
    let modifiedArray = [];
    if (compareProps.length === 0 && arr.length > 0)
        compareProps.push(...Object.keys(arr[0]));
    arr.map(item => {
        if (modifiedArray.length === 0) {
            modifiedArray.push(item);
        } else {
            if (!modifiedArray.some(item2 =>
                    compareProps.every(eachProps => item2[eachProps] === item[eachProps])
                )) { modifiedArray.push(item); }
        }
    });
    return modifiedArray;
}


// Functions to determine x,y domains for scaling 
// ==================================================  
function domainX(dataset, factor) {
    var domain = d3.extent(dataset, data => data[factor]);
    return domain;
};

function domainY(dataset, factor) {
    var domain = d3.extent(dataset, data => data[factor]);
    return domain;
};

// Functions to update axes transitions
// =====================================
function updateXAxis(xScale, xAxis) {
    var newXAxis = d3.axisBottom(xScale);

    // transition to change old xAxis to newXAxis
    xAxis.transition()
        .duration(1000)
        .call(newXAxis);
};

function updateYAxis(yScale, yAxis) {
    var newYAxis = d3.axisLeft(yScale);

    // transition to change old yAxis to newYAxis
    yAxis.transition()
        .duration(1000)
        .call(newYAxis);

};

// Function to update scatter plot (circles and text labels)
// ================================================================
function updatePlot(circlesGroup, idLabels, xScale, yScale, xAxisFactor, yAxisFactor) {

    // transition new circlesGroup by changing their posiitons according to new values
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => xScale(d[xAxisFactor]))
        .attr("cy", d => yScale(d[yAxisFactor]));

    // transition new state labels by changing their posiitons according to new values   
    idLabels.transition()
        .duration(1000)
        .attr("x", d => xScale(d[xAxisFactor]))
        .attr("y", d => yScale(d[yAxisFactor]) + 3.5)

};

// Function to update Tooltip
// ================================================================
function updateTooltip(xAxisFactor, yAxisFactor, circlesGroup, idLabels) {

    // create variables for displaying labels in tooltip
    var tooltipX = "";
    var tooltipY = "";

    // switch statement for xAxis value/label
    switch (xAxisFactor) {
        case "age":
            tooltipX = "Age";
            //xAxisFactor = Math.round(xAxisFactor);
            break;
        case "income":
            tooltipX = "Household Income";
            break;
        case "unemployment":
            tooltipX = "Unemployment Rate";
            break;
        default:
            break;
    };

    // switch statement for yAxis value/label
    switch (yAxisFactor) {
        case "Assault":
            tooltipY = "Assault crimes";
            break;
        case "Robbery":
            tooltipY = "Robbery crimes";
            break;
        case "Break and Enter":
            tooltipY = "Break and Enter crimes";
            break;
        default:
            break;
    };

    // Initialize D3 tooltip
    // ==============================
    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([40, -80])
        .html(function(d) {
            return (`<strong>${d.Neighbourhood} </strong>(ID: ${d.hoodID})<br>${tooltipX}: ${Math.round(d[xAxisFactor])}<br>${tooltipY}: ${d[yAxisFactor]}`);
        });

    // Create tooltip in the chart for both circles and id label groups
    // =======================================================================
    circlesGroup.call(toolTip);
    idLabels.call(toolTip);

    // Create event listeners to display and hide the tooltip
    // ==============================
    circlesGroup.on("mouseover", d => {
            toolTip.show(d, this)
        })
        .on("mouseout", d => {
            toolTip.hide(d);
        });

    idLabels.on("mouseover", d => {
            toolTip.show(d, this)
        })
        .on("mouseout", d => {
            toolTip.hide(d);
        });
};