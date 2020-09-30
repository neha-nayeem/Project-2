#################################################
# Dependencies Setup
#################################################
import pandas as pd
from flask_pymongo import PyMongo
from flask import Flask,jsonify, render_template
import numpy as np
from flask.json import JSONEncoder
import json

# --- create an instance of the Flask class ---
app = Flask(__name__)

# Use PyMongo to establish Mongo connection
mongo = PyMongo(app, uri="mongodb://localhost:27017/crime_db")

def removeDuplicates(l):
    seen = set()
    uniqueList = []
    for d in l:
        key = d['Neighbourhood']

        if key in seen:
            continue

        uniqueList.append(d)
        seen.add(key)

    return (uniqueList)

def formatValues(l):
    for d in l:
        d["hoodID"] = int(str(d["hoodID"])[:-2])
        d["age"] = round(d["age"], 1)
        d["population"] = int(str(d["population"])[:-2])
        d["populationDensity"] = int(str(d["populationDensity"])[:-2])

    return l
    
@app.route("/")
def home():
    return render_template("index.html")

@app.route("/api/v1/raw-data")
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

@app.route("/api/v1/neighbourhood-summary")
def neighbourhood_data():

    # Declare the collection
    collection = mongo.db.neighbourhood_summary

    # Get all results
    results = collection.find({}, {"_id": 0})

    # Get all unique neighbourhoods
    unique_hoods = collection.find().distinct('Neighbourhood Name')
    
    neighbourhoodCrimes = []

    # for loop to loop through each item in the unique neighbourhood list
    for x in unique_hoods:

        # new dict for each neighbourhood
        element = {}

        # change neighbourhood name to "Mimico" for the "Mimico (includes Humber Bay Shores)" neighbourhood for simplicity
        if (x == "Mimico (includes Humber Bay Shores)"):
            name = "Mimico"
        else:
            name = x
        
        element["Neighbourhood"] = name

        crimesList = []
        numberOfCrimes = []

        element["crimes"] = crimesList
        element["crime_numbers"] = numberOfCrimes

        for z in results:
            if (z["Neighbourhood Name"] == x):
                crime = z["MCI"]
                num = z["number_of_crime"]
                crimesList.append(crime)
                numberOfCrimes.append(num)

                # get the rest of the info for each neighbourhood, parsing into numerical if needed
                element["age"] = z["Average age"]
                element["hoodID"] = z["Hood_ID"]
                element["population"] = z["Population"]
                element["unemployment"] = z["Unemployment rate"]
                element["income"] = z["household_income"]
                element["populationDensity"] = z["population_density"]

                # store each item (dict) in the list
                neighbourhoodCrimes.append(element)
            else:
                break

    neighbourhoodCrimes = removeDuplicates(neighbourhoodCrimes)
    neighbourhoodCrimes = formatValues(neighbourhoodCrimes)

    # Return a jsonified list of dictionaries
    return jsonify(neighbourhoodCrimes)

if __name__ == "__main__":
    app.run(debug=True)
