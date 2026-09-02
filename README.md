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
- 🔄 English text → Morse Code conversion
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
