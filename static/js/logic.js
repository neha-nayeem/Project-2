// select the modal title 
var modalHeader = d3.select("#modal-heading");

// select the demographic info div's ul list group
var demographicsTable = d3.select("#demographic-info");

// select the bar chart div
var barChart = d3.select("#bar");

// select the scatter chart div
var scatterChart = d3.select("#scatter");

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

    // update the heading in the modal popup with neighbourhood name
    modalHeader.html(`Neighbourhood: ${neighbourhood}`);

    // ----------------------------------
    // POPULATE DEMOGRAPHICS TABLE
    // ----------------------------------

    // read in the JSON data
    d3.json("api/v1/neighbourhood-summary").then((data => {

        // filter the information for the neighbourhood chosen
        var neighbourhoodInfo = data.filter(item => item["Neighbourhood"] == neighbourhood)[0];

        // create a new UL element in the demographics div
        var newList = demographicsTable.append("ul")
            .attr("class", "list-group list-group-flush");

        // Iterate through each key and value in the demographics info
        Object.entries(neighbourhoodInfo).forEach(([key, value]) => {

            // conditional statement to not include the three keys below
            if ((key != "crimes") && (key != "Neighbourhood") && (key != "crime_numbers")) {

                // append a li item to the unordered list tag
                var listItem = newList.append("li");

                // change the class attributes of the list item for styling
                listItem.attr("class", "list-group-item p-1 bg-transparent");

                // create labels for the table
                var label = "";
                var labelValue = "";
                var unit = "";

                switch (key) {
                    case "age":
                        label = "Age (average)";
                        labelValue = value.toFixed(1);
                        unit = "yrs"
                        break;
                    case "hoodID":
                        label = "Neighbourhood ID";
                        labelValue = value;
                        break;
                    case "population":
                        label = "Population";
                        labelValue = value;
                        break;
                    case "unemployment":
                        label = "Unemployment rate";
                        labelValue = value;
                        unit = "%";
                        break;
                    case "income":
                        label = "Household income (average) $";
                        labelValue = value;
                        break;
                    case "populationDensity":
                        label = "Population density (per sq. km)"
                        labelValue = value;
                        break;
                    default:
                        break;
                }

                // add the key value pair from the metadata to the demographics list
                listItem.text(`${label}: ${labelValue} ${unit}`);
            }

        }); // close forEach

        // --------------------------------------------------
        // RETRIEVE DATA FOR PLOTTING CHARTS
        // --------------------------------------------------

        var crimeTypes = [];
        var crimeValues = [];

        // Iterate through each key and value in the sample to retrieve data for plotting
        Object.entries(neighbourhoodInfo).forEach(([key, value]) => {

            switch (key) {
                case "crimes":
                    crimeTypes.push(value);
                    break;
                case "crime_numbers":
                    crimeValues.push(value);
                default:
                    break;
            } // close switch statement

        }); // close forEach

        crimeTypes = crimeTypes[0];
        crimeValues = crimeValues[0];

        // // sort and reverse the arrays to get the top crime numbers in ascending order
        var sortedList = [];
        for (var i = 0; i < crimeTypes.length; i++) {
            sortedList.push({ "crime": crimeTypes[i], "number": crimeValues[i] });
        }
        sortedList.sort(function(a, b) {
            return ((a.number < b.number) ? -1 : ((a.number == b.number) ? 0 : 1));
        })

        for (var j = 0; j < sortedList.length; j++) {
            crimeTypes[j] = sortedList[j].crime;
            crimeValues[j] = sortedList[j].number;
        }

        // ----------------------------------
        // PLOT BAR CHART
        // ----------------------------------

        // create a trace
        var traceBar = {
            x: crimeValues,
            y: crimeTypes,
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
                r: 20,
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

    d3.json("/api/v1/neighbourhood-summary").then(data => {

        // create a new list for plotting scatter plot correctly
        var plotData = [];

        // loop through each neighbourhood
        for (var i = 0; i < data.length; i++) {

            var name = data[i]["Neighbourhood"];

            // create new dict for each neighbourhood
            var element = {};

            // add the name of the neighbourhood to the dict
            element["Neighbourhood"] = name;

            // store the crime type and numbers to an array each
            var crimesList = data[i]['crimes']
            var crimeNums = data[i]['crime_numbers']

            // go through the array to store the data as crime type: number - "Assault": 77 (e.g.)
            for (var j = 0; j < crimesList.length; j++) {
                var crime = crimesList[j];
                var num = crimeNums[j];
                element[crime] = num;
            }

            // get the rest of the info for each neighbourhood, parsing into numerical if needed
            element["age"] = +data[i]["age"];
            element["hoodID"] = +data[i]["hoodID"];
            element["population"] = +data[i]["population"];
            element["unemployment"] = +data[i]["unemployment"];
            element["income"] = +data[i]["income"];
            element["populationDensity"] = +data[i]["populationDensity"];

            // push to the new list
            plotData.push(element);
        }

        //console.log(plotData);

        // Initial chart x,y parameters
        // ============================================

        var xAxisFactor = "age";
        var yAxisFactor = "Assault";

        // Create x,y scales
        // ============================================

        var xScale = d3.scaleLinear().range([0, chartWidth]);
        var yScale = d3.scaleLinear().range([chartHeight, 0]);

        xScale.domain(domainX(plotData, xAxisFactor));
        yScale.domain(domainY(plotData, yAxisFactor));

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
            .data(plotData)
            .enter()
            .append("circle")
            .attr("cx", d => xScale(d[xAxisFactor]))
            .attr("cy", d => yScale(d[yAxisFactor]))
            .attr("r", "14")
            .attr("opacity", "0.6")
            .classed("nCircle", true);

        // Hood ID labels in circles
        // ========================= 
        var idLabels = chartGroup.append("g")
            .selectAll("text")
            .data(plotData)
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
                xScale.domain(domainX(plotData, xAxisFactor));

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
                yScale.domain(domainY(plotData, yAxisFactor));

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

    }); // close d3. then

}; // close makeResponsive() 

// call the responsive scatter plot function
makeResponsive();

// Event listener for window resize.
// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);



// Functions to determine x,y domains for scaling the scatter plot
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
        .offset([90, -90])
        .html(function(d) {
            return (`<strong>${d.Neighbourhood} </strong>(ID: ${d.hoodID})<br>${tooltipX}: ${d[xAxisFactor]}<br>${tooltipY}: ${d[yAxisFactor]}`);
        });

    // Create tooltip in the chart for both circles and id label groups
    // =======================================================================
    circlesGroup.call(toolTip);
    //idLabels.call(toolTip);

    // Create event listeners to display and hide the tooltip
    // ==============================
    circlesGroup.on("mouseover", d => {
            toolTip.show(d, this)
        })
        .on("mouseout", d => {
            toolTip.hide(d)
        })
        .on("click", d => {
            toolTip.show(d, this)
        });

    // idLabels.on("mouseover", d => {
    //         toolTip.show(d, this)
    //     })
    //     .on("mouseout", d => {
    //         toolTip.hide(d);
    //     });
};