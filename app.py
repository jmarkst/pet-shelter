from flask import Flask, request, jsonify, render_template, send_from_directory, abort, session, redirect, url_for, send_file
from flask_cors import CORS, cross_origin
from flask_session import Session
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import pickle
import sklearn
import pandas as pd
import numpy as np
import joblib
import os

from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, JWTManager


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


app = Flask(__name__)
cors = CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///comments.db'  # Change to your actual database
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'petshelter'
app.config["SECRET_KEY"] = "petsheltersession"

app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
Session(app)

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    post_id = db.Column(db.Integer, nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)

# Initialize DB
with app.app_context():
    db.create_all()

@app.route('/')
def home():
    user = session.get("user")
    return render_template("/_new/landing.html", user=user)

@app.route('/resources')
def resources():
    user = session.get("user")
    return render_template("/_new/resources.html", user=user)

@app.route('/faq')
def faq():
    user = session.get("user")
    return render_template("/_new/faq.html", user=user)

@app.route('/find-pet')
def eligibility():
    
    return render_template("/_new/find-pet.html")

@app.route('/find-ai')
def findAi():
    user = session.get("user")
    return render_template("/_new/find-ai.html", user=user)

@app.route('/search')
def search():
    return render_template("takefilters.html")

@app.route("/db")
def animals():
    animals = pd.read_csv("animals.csv")
    json = animals.to_json(orient="records", indent=2)
    return json

@app.route("/row", methods=["GET"])
def row():
    animals = pd.read_csv("animals.csv")
    id = request.args.get('id', default=0, type=int)
    row = animals.iloc[id]
    json = row.to_json(orient="records", indent=2)
    return json

@app.route("/login")
def login():
    user = session.get("user")
    return render_template("/_new/login.html", user=user)

@app.route("/logout")
def logout():
    session.pop("user", None)
    return redirect(url_for('home'))

@app.route("/register")
def register():
    user = session.get("user")
    return render_template("/_new/register.html", user=user)

@app.route("/user/register", methods=["POST"])
def registerUser():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if User.query.filter_by(username=username).first():
        return jsonify({"message": "User already exists"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(username=username, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201

@app.route("/contact")
def contact():
    user = session.get("user")
    return render_template("_new/contact.html", user=user)

@app.route("/user/login", methods=["POST"])
def loginUser():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()
    if not user or not bcrypt.check_password_hash(user.password, password):
        return jsonify({"message": "Invalid credentials"}), 401

    access_token = create_access_token(identity=username)
    session['user'] = username
    return jsonify({"message": "Login successful", "token": access_token}), 200

@app.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify({"message": "You are logged in", "user": current_user}), 200


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


@app.route("/info", methods=["GET"])
def pet_info():
    user = session.get("user")
    id=request.args.get('id')
    return render_template('_new/info.html', user=user, id=id)

@app.route("/adoption-form")
def adoptionform():
    filepath = url_for("static", filename="adoption-form.pdf")  # Path to the file
    return send_file(filepath, as_attachment=True)

@app.route("/pdf")
def serve_pdf():
    return send_file(url_for("static", filename="adoption-form.pdf"), as_attachment=False)

@app.route('/comment', methods=['POST'])
def post_comment():
    data = request.get_json()
    post_id = data.get('post_id')
    content = data.get('content')

    if not post_id or not content:
        return jsonify({'error': 'Post ID and content are required'}), 400

    new_comment = Comment(post_id=post_id, content=content)
    db.session.add(new_comment)
    db.session.commit()

    return jsonify({'message': 'Comment added successfully'}), 201

@app.route('/comments/<int:post_id>', methods=['GET'])
def get_comments(post_id):
    comments = Comment.query.filter_by(post_id=post_id).order_by(Comment.created_at.desc()).all()
    return jsonify([{'id': c.id, 'content': c.content, 'created_at': c.created_at} for c in comments])

@app.route('/browse')
def browse():
    user= session.get("user")
    return render_template("_new/browse.html", user=user)


@app.route('/password')
def password():
    user= session.get("user")
    return render_template("_new/password.html", user=user)

@app.route('/change-password', methods=['POST'])
def change_password():
    data = request.get_json()
    current_password = data.get('currentPassword')
    new_password = data.get('newPassword')
    current_user = data.get('user')

    # Get the current logged-in user (this assumes user is authenticated)
    user = User.query.filter_by(username=current_user).first()  # Replace with actual user session or login logic

    if not user:
        return jsonify({"success": False, "message": "User not found."})

    # Check if the current password is correct using bcrypt
    if not user or not bcrypt.check_password_hash(user.password, current_password):
        return jsonify({"message": "Invalid credentials"}), 401

    # Validate the new password (e.g., check minimum length)
    if len(new_password) < 8:
        return jsonify({"success": False, "message": "New password must be at least 6 characters long."})

    # Hash the new password using bcrypt
    hashed_password = bcrypt.generate_password_hash(new_password).decode('utf-8')
    
    # Update the password in the database
    user.password = hashed_password
    db.session.commit()

    return jsonify({"success": True, "message": "Password successfully changed!"})

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

IMAGE_FOLDER = os.path.join(app.static_folder, "pics")

@app.route("/pics/<int:image_id>")
def serve_image(image_id):
    """Serves a PNG image from the 'pics' directory based on the given ID."""
    filename = f"{image_id}.png"
    image_path = os.path.join(IMAGE_FOLDER, filename)

    # Check if the image exists
    if not os.path.exists(image_path):
        abort(404)  # Return 404 if the file does not exist

    return send_from_directory(IMAGE_FOLDER, filename, mimetype="image/png")

if __name__ == '__main__':
    app.run(debug=True)