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

    main_data =[]

    # Get all results
    results = collection.find({}, {"_id": 0})
    for y in results:
        main_data.append(y)

    # Get all unique neighbourhoods
    unique_hoods = collection.find().distinct('Neighbourhood Name')
    
    neighbourhoodCrimes = []

    # for loop to loop through each item in the unique neighbourhood list
    for i in range(len(unique_hoods)):

        name = unique_hoods[i]

        # new dict for each neighbourhood
        element = {}

        # change neighbourhood name to "Mimico" for the "Mimico (includes Humber Bay Shores)" neighbourhood for simplicity
        if (name == "Mimico (includes Humber Bay Shores)"):
            name = "Mimico"
        else:
            name = unique_hoods[i]
        
        element["Neighbourhood"] = name

        crimesList = []
        numberOfCrimes = []

        element["crimes"] = crimesList
        element["crime_numbers"] = numberOfCrimes

        for j in range(len(main_data)):

            if (main_data[j]["Neighbourhood Name"] == name):
                crime = main_data[j]["MCI"]
                num = main_data[j]["number_of_crime"]
                element["crimes"].append(crime)
                element["crime_numbers"].append(num)

                # get the rest of the info for each neighbourhood
                element["age"] = main_data[j]["Average age"]
                element["hoodID"] = main_data[j]["Hood_ID"]
                element["population"] = main_data[j]["Population"]
                element["unemployment"] = main_data[j]["Unemployment rate"]
                element["income"] = main_data[j]["household_income"]
                element["populationDensity"] = main_data[j]["population_density"]

                # store each item (dict) in the list
                neighbourhoodCrimes.append(element)

    neighbourhoodCrimes = removeDuplicates(neighbourhoodCrimes)
    neighbourhoodCrimes = formatValues(neighbourhoodCrimes)

    # Return a jsonified list of dictionaries
    return jsonify(neighbourhoodCrimes)

if __name__ == "__main__":
    app.run(debug=True)
