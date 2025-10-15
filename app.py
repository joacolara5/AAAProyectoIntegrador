from flask import Flask, render_template, send_from_directory

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/data/<path:filename>')
def data_file(filename):
    return send_from_directory('data', filename)

if __name__ == '__main__':
    app.run(debug=True)
