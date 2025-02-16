from flask import Flask, request, jsonify, render_template
from flask_cors import CORS, cross_origin
import pickle
import sklearn
import pandas as pd
import numpy as np
import joblib

app = Flask(__name__)
cors = CORS(app)
owners = joblib.load("owners.pickle")
pets = joblib.load("pets3.pickle")

mappings = {
    "finance": ["low", "mid", "high"],
    "clean": ["yes", "no"],
    "adopt": ["me", "others"],
    "has_pets": ["yes", "no"],
    "pets": ["one", "two", "few", "many", "none"],
    "environment": ["yes", "no"],
    "restrictions": ["yes", "no"],
}

maps = {
    "pet": ['dog', 'cat'],
    "want_pet": ['dog', 'cat'],
    "age": ['1 months', '2 months', '3 months', '4 months', '5 months', '6 months',
       '7 months', '8 months', '9 months', '10 months', '11 months', '1 years',
       '2 years', '3 years', '4 years', '5 years'],
    "want_age": ['1 months', '2 months', '3 months', '4 months', '5 months', '6 months',
       '7 months', '8 months', '9 months', '10 months', '11 months', '1 years',
       '2 years', '3 years', '4 years', '5 years'],
    "sex": ['male', 'female'],
    "want_sex": ['male', 'female'],
    "color": ['Brown and white', 'Brown', 'White', 'Black', 'Mocha',
       'Black and white', 'Tri-color', 'White and orange', 'White and gray',
       'Brown and gray'],
    "want_color": ['Brown and white', 'Brown', 'White', 'Black', 'Mocha',
       'Black and white', 'Tri-color', 'White and orange', 'White and gray',
       'Brown and gray'],
    "size": ['small', 'medium', 'large'],
    "want_size": ['small', 'medium', 'large']
}

output_labels = ["no", "maybe", "yes"]

pet_db = pd.read_csv("animals.csv")

@app.route('/')
def home():
    return render_template("main.html")

@app.route('/eligibility')
def eligibility():
    return render_template("taketest.html")

@app.route('/search')
def search():
    return render_template("takefilters.html")

@app.route("/db")
def db():
    animals = pd.read_csv("animals.csv")
    json = animals.to_json(orient="records", indent=2)
    return json

@app.route('/owner', methods=['POST'])
def predict():
    print("owner")
    try:
        data = request.get_json()
        print(data)
        params = {}
        for key in mappings.keys():
            if key not in data:
                return f"Missing value for {key}", 400
            if data[key] not in mappings[key]:
                return f"Invalid value for {key}. Allowed values: {mappings[key]}", 400
            params[key] = data[key]

        input_values = [mappings[key].index(params[key]) for key in mappings.keys()]

        input_array = np.array(input_values).reshape(1, -1)
        prediction = owners.predict(input_array)[0]
        probabilities = owners.predict_proba(input_array)[0]
        proba_dict = {output_labels[i]: round(probabilities[i] * 100, 2) for i in range(len(output_labels))}

        predicted = output_labels[prediction]
        confidence = round(probabilities[prediction] * 100, 2)

        return jsonify({"verdict": predicted, "confidence": confidence, "results": proba_dict})
    
    except Exception as e:
        return f"Error: {str(e)}", 500

@app.route("/pet", methods=["POST"])
def predict_pet():
    try:
        data = request.get_json()
        want_keys = ["want_pet", "want_age", "want_sex", "want_color", "want_size"]

        valid_values = {
            "want_pet": ["dog", "cat"],
            "want_age": ["1 months", "2 months", "3 months", "6 months", "1 years", "2 years", "3 years", "4 years", "5 years"],
            "want_sex": ["male", "female"],
            "want_size": ["small", "medium", "large"]
        }

        params = {}
        for key in want_keys:
            if key not in data:
                return jsonify({"error": f"Missing value for {key}"}), 400
            value = data[key]
            if key != "want_color" and value not in valid_values[key]:
                return jsonify({"error": f"Invalid value for {key}. Allowed values: {valid_values[key]}"}), 400
            params[key] = value

        if data["want_pet"] == "dog":
            valid_color_dogs = ["Brown and white", "Brown", "White", "Black", "Mocha", "Black and white"]
            if data["want_color"] not in valid_color_dogs:
                return jsonify({"error": "Invalid color for dog. Allowed values: ['Brown and white', 'Brown', 'White', 'Black', 'Mocha', 'Black and white']"}), 400
        elif data["want_pet"] == "cat":
            valid_color_cats = ["Tri-color", "Black and white", "White and orange", "White and gray", "White", "Brown and gray"]
            if data["want_color"] not in valid_color_cats:
                return jsonify({"error": "Invalid color for cat. Allowed values: ['Tri-color', 'Black and white', 'White and orange', 'White and gray', 'White', 'Brown and gray']"}), 400

        if "number" not in data:
            return jsonify({"error": "Missing value for 'number'"}), 400
        if not isinstance(data["number"], int) or data["number"] <= 0:
            return jsonify({"error": "'number' must be a positive integer"}), 400
        if data["number"] > 50:
            return jsonify({"error": "'number' exceeds the hard limit of 50"}), 400

        num_pets = min(data["number"], 10)  # Limit the number of results to 10
        selected_pets = []
        selected_indices = []

        for index, row in pet_db.iterrows():
            if len(selected_pets) >= num_pets:
                break  # Stop when we have enough pets

            random_pet = row.to_dict()
            print(random_pet)
            print(params)

            # Prepare final input combining shelter pet and user preferences
            input_values = [
                maps["pet"].index(random_pet["pet"]),
                maps["want_pet"].index(params["want_pet"]),
                maps["age"].index(random_pet["age"]),
                maps["want_age"].index(params["want_age"]),
                maps["sex"].index(random_pet["sex"]),
                maps["want_sex"].index(params["want_sex"]),
                maps["color"].index(random_pet["color"]),
                maps["want_color"].index(params["want_color"]),
                maps["size"].index(random_pet["size"]),
                maps["want_size"].index(params["want_size"]),
            ]
            print(input_values)

            # Predict using the model
            #input_array = np.array(input_values).reshape(1, -1)
            inputs = [[1, 1, 11, 11, 0, 0, 5, 5, 1, 1]]
            prediction = pets.predict([input_values])[0]
            probabilities = pets.predict_proba([input_values])[0]

            #output_labels = ["yes", "maybe", "no"]
            print(probabilities)
            #print(input_values, prediction, probabilities)

            if output_labels[prediction] == "no":
                continue  # Skip if prediction is "no"

            selected_pets.append({
                "selected_pet": random_pet,
                "prediction": output_labels[prediction],
                "confidence": round(probabilities[prediction] * 100, 2),
                "probabilities": {output_labels[i]: round(probabilities[i] * 100, 2) for i in range(len(output_labels))}
            })

            selected_indices.append(index)
        print(pets.get_params())
        # Return the results in JSON format
        return jsonify({
            "selected_indices": selected_indices,
            "selected_pets": selected_pets
        })

    except Exception as e:
        return jsonify({"error": e}), 500


if __name__ == '__main__':
    app.run(debug=True)