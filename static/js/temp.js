var queryurl = "http://127.0.0.1:5000/api"
console.log("THIS IS TEMP.js")
d3.json(queryurl).then(function (data) {
  console.log(data);
// Once we get a response, send the data.features object to the createFeatures function
//  createFeatures(data);
});