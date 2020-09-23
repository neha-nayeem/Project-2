#################################################
# Dependencies Setup
#################################################
import pandas as pd
from flask_pymongo import PyMongo
from flask import Flask,jsonify
import numpy as np
from flask.json import JSONEncoder

# --- create an instance of the Flask class ---
app = Flask(__name__)

# Use PyMongo to establish Mongo connection
mongo = PyMongo(app, uri="mongodb://localhost:27017/crime_db")

@app.route("/")
def home():

    # Declare the collection
    collection = mongo.db.all_crimes

    data_list=[]
    for x in collection.find({}, {"_id": 0}):
        data_list.append(x)  

    # TRYING FILTERING
    
    # filter = {"MCI": "Robbery"}

    # for x in collection.find(filter):
    #     print(x)

    return jsonify(data_list)

@app.route("/scatter")
def scatter():

    # Declare the collection
    collection = mongo.db.all_crimes

    scatter_data=[]
    for x in collection.find({}, {"_id": 0}):
        avg_age = x["Average age"]
        income = x["  Average after-tax income of households in 2015 ($)"]
        unemployment = x["Unemployment rate"]
        neighbourhood = x["Neighbourhood Name"]

        scatter = {
            "Neighbourhood": neighbourhood,
            "Avg_age": avg_age, 
            "Avg_income": income, 
            "Unemployment_rate": unemployment
        }


        scatter_data.append(scatter)  

    return jsonify(scatter_data)



if __name__ == "__main__":
    app.run(debug=True)