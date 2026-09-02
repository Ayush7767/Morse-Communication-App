# 🆘 Morse Communication Web Application

![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)
![Flask](https://img.shields.io/badge/Flask-3.1+-black.svg)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)
![HTML5](https://img.shields.io/badge/HTML5-5-orange.svg)
![CSS3](https://img.shields.io/badge/CSS3-3-blue.svg)
![Render](https://img.shields.io/badge/Deployed%20on-Render-purple.svg)
![Status](https://img.shields.io/badge/Status-Active-success.svg)

A web-based **Morse Code Communication System** designed to help users communicate using Morse code through simple **Dot, Dash, Space, and Speak controls**.

The application converts Morse code into readable text and provides text-to-speech functionality, making communication possible through a simple and accessible interface.

The project also includes an interactive **Morse Code learning tutorial** for learning the English alphabet using Morse code.

---

# 🚀 Features

- 🔵 **Dot Button** for entering Morse dots (`.`)
- ➖ **Dash Button** for entering Morse dashes (`-`)
- ⬜ **Space Button** for separating Morse characters
- 🔊 **Speak Button** for text-to-speech output
- 🔄 Morse Code → English text conversion
- 📚 Interactive Morse Code tutorial
- 🔤 Learn Morse Code for A–Z
- ▶️ Start/Stop tutorial controls
- ⏭️ Next tutorial lesson navigation
- 🔊 Audio feedback for Morse input
- 🌐 Web-based interface accessible from desktop and mobile devices
- 🐍 Flask backend
- ☁️ Deployed using Render

---

# 🧩 Architecture

```text

                  User
                   │
                   ▼
          Morse Communication UI
                   │
          ┌────────┴─────────┐
          │                  │
          ▼                  ▼
     Dot / Dash /        Text Input
       Space Input           │
          │                  │
          ▼                  ▼
       Morse Code      Text → Morse
          │
          ▼
    Morse Processing
          │
          ▼
     Morse → Text
          │
          ▼
      Speak / Audio
          │
          ▼
        User
````

---

# 📂 Project Structure

```text
Morse-Communication-App
│
├── app.py
├── morse_engine.py
├── requirements.txt
├── test_app.py
├── README.md
├── .gitignore
│
└── static/
    ├── index.html
    ├── app.js
    └── style.css
```

---

# ⚙️ Application Workflow

## 1️⃣ Enter Morse Code

The user can create Morse code using:

```text
Dot   → .
Dash  → -
Space → separates characters
```

Example:

```text
... --- ...
```

represents:

```text
SOS
```

---

## 2️⃣ Morse Code Conversion

The Morse engine processes the entered Morse code and converts it into readable English text.

Example:

```text
.... . .-.. .-.. ---
```

Output:

```text
HELLO
```
---

## 3️⃣ Speech Output

The application provides a **Speak** function that converts the generated text into speech.

This allows the user to hear the decoded message instead of only reading it.

---

# 📚 Morse Code Tutorial

The application contains an interactive tutorial for learning Morse Code.

Users can learn the Morse representation of letters from:

```text
A → Z
```

Example:

| Letter | Morse  |
| ------ | ------ |
| A      | `.-`   |
| B      | `-...` |
| C      | `-.-.` |
| D      | `-..`  |
| E      | `.`    |
| F      | `..-.` |
| G      | `--.`  |
| H      | `....` |
| I      | `..`   |
| J      | `.---` |
| K      | `-.-`  |
| L      | `.-..` |
| M      | `--`   |
| N      | `-.`   |
| O      | `---`  |
| P      | `.--.` |
| Q      | `--.-` |
| R      | `.-.`  |
| S      | `...`  |
| T      | `-`    |
| U      | `..-`  |
| V      | `...-` |
| W      | `.--`  |
| X      | `-..-` |
| Y      | `-.--` |
| Z      | `--..` |

---

# 🔊 Audio Feedback

The application provides audio feedback while entering Morse code.

For example:

```text
Dot  → Short beep
Dash → Long beep
```

This allows users to recognize Morse input through sound as well as visual feedback.

---

# 🌐 Live Demo

The application is deployed using Render.

### 🚀 Live Website

[https://morse-communication-app.onrender.com](https://morse-communication-app.onrender.com)

---

# 📦 Installation

## 1️⃣ Clone Repository

```bash
git clone https://github.com/Ayush7767/Morse-Communication-App.git
```

Go to the project directory:

```bash
cd Morse-Communication-App
```

---

## 2️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

---

# ▶️ Run Locally

Start the Flask application:

```bash
python app.py
```

---

# 🧠 Technologies Used

### Backend

* Python
* Flask
* Flask-CORS

### Frontend

* HTML5
* CSS3
* JavaScript

### Communication

* Morse Code
* Web Speech / Text-to-Speech
* Audio feedback

### Deployment

* Git
* GitHub
* Render
* Gunicorn

---

# 🎯 Use Cases

This application can be useful for:

* 🧑‍🦯 Accessible communication
* 🤐 Communication for people who cannot speak
* 📚 Learning Morse Code
* 🎓 College projects
* 🔊 Audio-assisted communication
* 📡 Understanding Morse Code communication
* 🧪 Demonstrating human-computer interaction

---

# ♿ Accessibility Goal

The main goal of this project is to explore a simple communication interface that can be operated using a small number of controls.

The interface is based around:

```text
┌───────────┐
│    DOT    │
├───────────┤
│   DASH    │
├───────────┤
│   SPACE   │
├───────────┤
│   SPEAK   │
└───────────┘
```

This simplified interaction model can make Morse-based communication easier to understand and operate.

---

# 🔐 Privacy

The application is designed primarily as a client/server web application.

Users should avoid entering sensitive or private information into publicly accessible deployments.

No passwords, API keys, or private credentials should be stored directly in the source code.

---

# 📈 Future Improvements

Possible future improvements include:

* 📱 Dedicated Android application
* 🎤 Voice-to-Morse conversion
* 📷 Camera-based Morse recognition
* 🤟 Gesture-based Morse input
* ⌚ Wearable device support
* 📳 Vibration feedback
* 🔊 Custom Morse audio frequencies
* 🌍 Multi-language text conversion
* 💾 User communication history
* 👥 Real-time communication between two users
* 🔐 End-to-end encrypted communication
* 🧠 AI-assisted Morse prediction
* 🎨 Improved accessibility modes
* 📴 Better offline support

---


---

# 👨‍💻 Author

**Ayush Gaikwad**

Morse Communication Web Application

---

# ⭐ Support

If you find this project useful:

⭐ Star the repository
🍴 Fork the project
📢 Share the project
🐛 Report issues
💡 Suggest improvements

---

# 🔗 Links

### GitHub Repository

[https://github.com/Ayush7767/Morse-Communication-App](https://github.com/Ayush7767/Morse-Communication-App)

### Live Application

[https://morse-communication-app.onrender.com](https://morse-communication-app.onrender.com)

```

### One correction I'd make before you publish it

Don't claim things like **"designed specifically for blind and non-speaking people"** unless your app has actually been tested for accessibility with those users. That's a stronger claim than your current implementation supports.

A safer and more credible description is:

> **"A Morse Code communication web application exploring accessible communication through simple button-based input, audio feedback, and text-to-speech."**

That sounds professional **without overselling what the current version can actually do.**
```
