#################################################
# Dependencies Setup
#################################################
import pandas as pd
from flask_pymongo import PyMongo
from flask import Flask,jsonify, render_template
import numpy as np
from flask.json import JSONEncoder

# --- create an instance of the Flask class ---
app = Flask(__name__)

# Use PyMongo to establish Mongo connection
mongo = PyMongo(app, uri="mongodb://localhost:27017/crime_db")

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/all-data")
def get_data():

    # Declare the collection
    collection = mongo.db.all_crimes

    # Create an empty list to store data
    data_list=[]

    # Get all results
    results = collection.find({}, {"_id": 0})

    # for loop to loop through each item in the database
    for x in results:
        # store each item (dict) in the list
        data_list.append(x)

    # Return a jsonified list of dictionaries
    return jsonify(data_list)

@app.route("/map")
def temp():
    return render_template("map.html")

@app.route("/charts")
def charts():

    # Declare the collection
    collection = mongo.db.neighbourhood_summary

    chart_data=[]

    # Get only the data for robbery, assault and break and enter
    
    # for x in collection.find({}, {"_id": 0}):
        # avg_age = x["Average age"]
        # income = x["household_income"]
        # unemployment = x["Unemployment rate"]
        # neighbourhood = x["Neighbourhood Name"]
        # crime = x["MCI"]
        # population_density=x["population_density"]
        # population=x["Population"]
        # number_of_crime=x["number_of_crime"]
        

        # data = {
        #     "Neighbourhood": neighbourhood,
        #     "Avg_age": avg_age, 
        #     "Avg_income": income, 
        #     "Unemployment_rate": unemployment,
        #     "Crime": crime,
        #     "Population": population,
        #     "Population_density": population_density,
        #     "Number_of_crime":number_of_crime
        # }
        # Get all results
    results = collection.find({}, {"_id": 0})

        # for loop to loop through each item in the database
    for x in results:
        # store each item (dict) in the list
        chart_data.append(x)

    # Return a jsonified list of dictionaries
    return jsonify(chart_data)

    #     chart_data.append(data)  

    # # Return a jsonified list of dictionaries
    # return jsonify(chart_data)

if __name__ == "__main__":
    app.run(debug=True)
