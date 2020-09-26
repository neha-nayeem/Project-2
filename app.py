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

@app.route("/api")
def home():

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

@app.route("/gototemp")
def temp():
    return render_template("temp.html")

@app.route("/scatter")
def scatter():

    # Declare the collection
    collection = mongo.db.all_crimes

    scatter_data=[]

    # Get only the data for robbery, assault and break and enter
    
    for x in collection.find({'$or': [{'MCI': 'Robbery'}, {'MCI': 'Assault'}, {'MCI': 'Break and Enter'}]}, {"_id": 0}):
        avg_age = x["Average age"]
        income = x["  Average after-tax income of households in 2015 ($)"]
        unemployment = x["Unemployment rate"]
        neighbourhood = x["Neighbourhood Name"]
        crime = x["MCI"]

        scatter = {
            "Neighbourhood": neighbourhood,
            "Avg_age": avg_age, 
            "Avg_income": income, 
            "Unemployment_rate": unemployment,
            "Crime": crime
        }

        scatter_data.append(scatter)  

    # Return template and data
    return render_template("index.html", info=scatter_data)


if __name__ == "__main__":
    app.run(debug=True)