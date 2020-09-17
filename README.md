# CropperHead UI
A simple UI for a neural network model which has been trained to automatically crop images based on their content. See the live demo at cropper-head.herokuapp.com. (Might take a few seconds for the service to boot up at Heroku)

Allows users to send their own preferred crops to a server to be used in training of future, hopefully better, networks. 

Implemented using Flask and Javascript. Hosted in Heroku at the time being.

## Installation
Should you want to try running it yourself, locally just:

1. Clone the repo:
    ```shell
    git clone https://github.com/PebbleBonk/CropperHead-UI.git
    ```
2. Install the requirements:
    ```shell
    pip install -r requirements
    ```
3. Run the app from the root folder:
    ```shell
    python app.py
    ```
4. Open the webbrowser (by default at *http://localhost:5000*) and go wild