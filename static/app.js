// MorseAssist Javascript Application

// Audio State
let audioCtx = null;
let frequencyInput = document.getElementById("tone-frequency");
let volumeInput = document.getElementById("tone-volume");
let frequencyDisplay = document.getElementById("frequency-display");

// TTS State Selector
let ttsEngineSelect = document.getElementById("tts-engine-select");

// UI Elements
const currentPatternEl = document.getElementById("current-pattern");
const decodedMessageEl = document.getElementById("decoded-message");
const btnDot = document.getElementById("btn-dot");
const btnDash = document.getElementById("btn-dash");
const btnSpace = document.getElementById("btn-space");
const btnSpeak = document.getElementById("btn-speak");
const btnBackspace = document.getElementById("btn-backspace");
const btnClear = document.getElementById("btn-clear");

// Tutorial Elements
const btnTutorialToggle = document.getElementById("btn-tutorial-toggle");
const tutorialWorkspace = document.getElementById("tutorial-workspace");
const btnTutorialPrev = document.getElementById("btn-tutorial-prev");
const btnTutorialNext = document.getElementById("btn-tutorial-next");
const btnTutorialPlay = document.getElementById("btn-tutorial-play");
const tutorialLetterEl = document.getElementById("tutorial-letter");
const tutorialPatternEl = document.getElementById("tutorial-pattern-display");

// Cache for tracking previous values to prevent redundant speech
let lastAnnouncedMessage = "";
let lastAnnouncedPattern = "";

// Initialize Audio Context lazily on user gesture
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

// Update Frequency slider display
frequencyInput.addEventListener("input", () => {
    frequencyDisplay.textContent = `${frequencyInput.value} Hz`;
});

// Synthesize Morse Tone (clean Sine Wave)
function playTone(durationMs) {
    try {
        initAudio();
        if (!audioCtx) return;

        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        const freq = parseFloat(frequencyInput.value) || 600;
        const volume = parseFloat(volumeInput.value) || 0.5;

        osc.type = "sine";
        osc.frequency.value = freq;

        // Apply smooth envelope to prevent pop clicks
        const now = audioCtx.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        // Attack
        gainNode.gain.linearRampToValueAtTime(volume, now + 0.005);
        // Maintain
        gainNode.gain.setValueAtTime(volume, now + (durationMs / 1000) - 0.01);
        // Decay/Release
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + (durationMs / 1000));

        osc.start(now);
        osc.stop(now + (durationMs / 1000));
    } catch (e) {
        console.error("Audio synthesis failed:", e);
    }
}

// Speak Text using selected TTS engine
function speakText(text, callback) {
    if (!text || text.trim() === "") {
        if (callback) callback();
        return;
    }

    const engine = ttsEngineSelect.value;

    if (engine === "browser") {
        // Stop current speech to avoid overlapping
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.85; // Calmer, slightly slower speech
        utterance.volume = 1.0;
        
        // Pick a female voice if available in the browser
        const voices = window.speechSynthesis.getVoices();
        const femaleVoice = voices.find(v => 
            v.name.toLowerCase().includes("female") || 
            v.name.toLowerCase().includes("zira") || 
            v.name.toLowerCase().includes("samantha") || 
            v.name.toLowerCase().includes("hazel")
        );
        if (femaleVoice) {
            utterance.voice = femaleVoice;
        }

        utterance.onend = () => {
            if (callback) callback();
        };
        utterance.onerror = (e) => {
            console.error("SpeechSynthesis error:", e);
            if (callback) callback();
        };

        window.speechSynthesis.speak(utterance);
    } else {
        // Python Backend TTS
        const audio = new Audio(`/api/tts?text=${encodeURIComponent(text)}`);
        audio.onended = () => {
            if (callback) callback();
        };
        audio.onerror = () => {
            console.warn("Backend TTS failed, falling back to Browser TTS");
            // Graceful fallback to browser speech synthesis
            const fallbackUtterance = new SpeechSynthesisUtterance(text);
            fallbackUtterance.rate = 0.85;
            fallbackUtterance.onend = () => {
                if (callback) callback();
            };
            window.speechSynthesis.speak(fallbackUtterance);
        };
        audio.play().catch(e => {
            console.error("Audio playback error, calling callback directly:", e);
            if (callback) callback();
        });
    }
}

// Play out Morse Code pattern beeps sequentially
function playMorsePattern(pattern, callback) {
    if (!pattern || pattern.length === 0) {
        if (callback) callback();
        return;
    }

    let index = 0;
    function playNext() {
        if (index >= pattern.length) {
            if (callback) callback();
            return;
        }

        const symbol = pattern[index++];
        if (symbol === ".") {
            playTone(100);
            setTimeout(playNext, 250); // 100ms tone + 150ms gap
        } else if (symbol === "-") {
            playTone(300);
            setTimeout(playNext, 450); // 300ms tone + 150ms gap
        } else {
            setTimeout(playNext, 200);
        }
    }
    playNext();
}

// Screen Reader ARIA Live announcer
function announce(text) {
    const announcer = document.getElementById("sr-announcer");
    announcer.textContent = "";
    setTimeout(() => {
        announcer.textContent = text;
    }, 50);
}

// Update DOM elements based on backend API state
function renderState(state) {
    // Render pattern text
    const currentPattern = state.current_pattern || "";
    currentPatternEl.textContent = currentPattern || "Ready...";
    
    // Render message text
    const currentMessage = state.message || "";
    decodedMessageEl.textContent = currentMessage;

    // Handle accessibility announcements for signals
    if (currentPattern && currentPattern !== lastAnnouncedPattern) {
        // Announce latest signal entered
        const lastChar = currentPattern[currentPattern.length - 1];
        announce(lastChar === "." ? "Dot" : "Dash");
    }
    lastAnnouncedPattern = currentPattern;

    // Render tutorial state
    if (state.tutorial_active) {
        tutorialWorkspace.classList.remove("disabled");
        tutorialWorkspace.removeAttribute("aria-disabled");
        btnTutorialPrev.removeAttribute("disabled");
        btnTutorialNext.removeAttribute("disabled");
        btnTutorialPlay.removeAttribute("disabled");
        btnTutorialToggle.textContent = "Stop Tutorial";
        btnTutorialToggle.setAttribute("aria-label", "Stop Alphabet Tutorial Mode");

        tutorialLetterEl.textContent = state.tutorial_letter || "-";
        tutorialPatternEl.textContent = state.tutorial_pattern || "-";
    } else {
        tutorialWorkspace.classList.add("disabled");
        tutorialWorkspace.setAttribute("aria-disabled", "true");
        btnTutorialPrev.setAttribute("disabled", "true");
        btnTutorialNext.setAttribute("disabled", "true");
        btnTutorialPlay.setAttribute("disabled", "true");
        btnTutorialToggle.textContent = "Start Tutorial";
        btnTutorialToggle.setAttribute("aria-label", "Start Alphabet Tutorial Mode");

        tutorialLetterEl.textContent = "-";
        tutorialPatternEl.textContent = "-";
    }
}

// Synchronize state from backend
async function fetchState() {
    try {
        const res = await fetch("/api/state");
        const state = await res.json();
        renderState(state);
        return state;
    } catch (e) {
        console.error("Failed to fetch state:", e);
    }
}

// Handle Dot input
async function onDot() {
    initAudio();
    playTone(100);
    try {
        const res = await fetch("/api/press/dot", { method: "POST" });
        const state = await res.json();
        renderState(state);
    } catch (e) {
        console.error(e);
    }
}

// Handle Dash input
async function onDash() {
    initAudio();
    playTone(300);
    try {
        const res = await fetch("/api/press/dash", { method: "POST" });
        const state = await res.json();
        renderState(state);
    } catch (e) {
        console.error(e);
    }
}

// Handle Space / Commit input
async function onSpace() {
    initAudio();
    try {
        const res = await fetch("/api/press/space", { method: "POST" });
        const data = await res.json();
        renderState(data.state);
        
        // Announce decoded character or space
        if (data.decoded) {
            if (data.decoded === " ") {
                announce("Word space");
            } else if (data.decoded === "?") {
                announce("Unknown pattern");
            } else {
                announce(`Decoded ${data.decoded}`);
                // Optional voice feedback for each completed letter
                speakText(data.decoded);
            }
        }
    } catch (e) {
        console.error(e);
    }
}

// Handle Backspace / Undo input
async function onBackspace() {
    initAudio();
    try {
        const res = await fetch("/api/press/backspace", { method: "POST" });
        const data = await res.json();
        renderState(data.state);
        if (data.removed) {
            announce(`Removed ${data.removed}`);
        } else {
            announce("Nothing to remove");
        }
    } catch (e) {
        console.error(e);
    }
}

// Handle Clear Message input
async function onClear() {
    initAudio();
    try {
        const res = await fetch("/api/press/clear", { method: "POST" });
        const state = await res.json();
        renderState(state);
        announce("Message cleared");
    } catch (e) {
        console.error(e);
    }
}

// Handle Speak input
async function onSpeak() {
    initAudio();
    try {
        const res = await fetch("/api/state");
        const state = await res.json();
        const msg = state.message;
        
        if (!msg || msg.trim() === "") {
            announce("Message is empty");
            speakText("Message is empty");
            return;
        }

        announce(`Speaking: ${msg}`);
        // Speak, then clear the message on backend
        speakText(msg, async () => {
            // Once spoken, clear message
            const clearRes = await fetch("/api/press/clear", { method: "POST" });
            const clearedState = await clearRes.json();
            renderState(clearedState);
            announce("Message auto cleared after speaking");
        });
    } catch (e) {
        console.error(e);
    }
}

// Handle Toggle Tutorial Mode
async function onTutorialToggle() {
    initAudio();
    try {
        const res = await fetch("/api/tutorial/toggle", { method: "POST" });
        const state = await res.json();
        renderState(state);

        if (state.tutorial_active) {
            announce("Tutorial mode activated. Press Left or Right arrow to cycle letters.");
            playTutorialLetterSequence(state.tutorial_letter, state.tutorial_pattern);
        } else {
            announce("Tutorial mode deactivated.");
        }
    } catch (e) {
        console.error(e);
    }
}

// Handle Cycle Next tutorial letter
async function onTutorialNext() {
    initAudio();
    try {
        const res = await fetch("/api/tutorial/next", { method: "POST" });
        const state = await res.json();
        renderState(state);
        playTutorialLetterSequence(state.tutorial_letter, state.tutorial_pattern);
    } catch (e) {
        console.error(e);
    }
}

// Handle Cycle Previous tutorial letter
async function onTutorialPrev() {
    initAudio();
    try {
        const res = await fetch("/api/tutorial/prev", { method: "POST" });
        const state = await res.json();
        renderState(state);
        playTutorialLetterSequence(state.tutorial_letter, state.tutorial_pattern);
    } catch (e) {
        console.error(e);
    }
}

// Play Tutorial Audio Sequence (Speak Letter -> Pause -> Play Morse Tone Sequence)
function playTutorialLetterSequence(letter, pattern) {
    if (!letter) return;
    
    announce(`Letter ${letter}`);
    // Disable navigator buttons during play to prevent double-firing
    setTutorialButtonsEnabled(false);

    speakText(letter, () => {
        // Pause briefly before beep sequences
        setTimeout(() => {
            playMorsePattern(pattern, () => {
                setTutorialButtonsEnabled(true);
            });
        }, 150);
    });
}

function setTutorialButtonsEnabled(enabled) {
    if (enabled) {
        btnTutorialPrev.removeAttribute("disabled");
        btnTutorialNext.removeAttribute("disabled");
        btnTutorialPlay.removeAttribute("disabled");
    } else {
        btnTutorialPrev.setAttribute("disabled", "true");
        btnTutorialNext.setAttribute("disabled", "true");
        btnTutorialPlay.setAttribute("disabled", "true");
    }
}

// Trigger Play current tutorial letter manually
async function onTutorialPlay() {
    initAudio();
    try {
        const res = await fetch("/api/state");
        const state = await res.json();
        if (state.tutorial_active) {
            playTutorialLetterSequence(state.tutorial_letter, state.tutorial_pattern);
        }
    } catch (e) {
        console.error(e);
    }
}

// Setup Event Listeners
btnDot.addEventListener("click", onDot);
btnDash.addEventListener("click", onDash);
btnSpace.addEventListener("click", onSpace);
btnSpeak.addEventListener("click", onSpeak);
btnBackspace.addEventListener("click", onBackspace);
btnClear.addEventListener("click", onClear);

btnTutorialToggle.addEventListener("click", onTutorialToggle);
btnTutorialPrev.addEventListener("click", onTutorialPrev);
btnTutorialNext.addEventListener("click", onTutorialNext);
btnTutorialPlay.addEventListener("click", onTutorialPlay);

// Global Keyboard Event Routing
window.addEventListener("keydown", (e) => {
    // Avoid interfering with range inputs/selects in specific ways,
    // but handle standard shortcut commands
    
    const key = e.key.toLowerCase();
    
    // Check if focused element is a select dropdown (prevent spacebar interference)
    if (document.activeElement.tagName === "SELECT" && key === " ") {
        return; 
    }

    switch (key) {
        case ".":
        case "1":
            e.preventDefault();
            onDot();
            break;
        case "-":
        case "2":
            e.preventDefault();
            onDash();
            break;
        case " ":
        case "3":
            e.preventDefault();
            onSpace();
            break;
        case "enter":
        case "4":
            e.preventDefault();
            onSpeak();
            break;
        case "backspace":
            // Only backspace if we aren't editing a slider/text field
            if (document.activeElement.tagName !== "INPUT") {
                e.preventDefault();
                onBackspace();
            }
            break;
        case "escape":
            e.preventDefault();
            onClear();
            break;
        case "t":
            e.preventDefault();
            onTutorialToggle();
            break;
        case "arrowleft":
        case "[":
            // Check if tutorial is active to navigate
            if (tutorialWorkspace.classList.contains("disabled")) return;
            e.preventDefault();
            onTutorialPrev();
            break;
        case "arrowright":
        case "]":
            if (tutorialWorkspace.classList.contains("disabled")) return;
            e.preventDefault();
            onTutorialNext();
            break;
        case "p":
            if (tutorialWorkspace.classList.contains("disabled")) return;
            e.preventDefault();
            onTutorialPlay();
            break;
    }
});

// Load Voices async for Browser TTS engine list
if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.getVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
}

// Initial state fetch on startup
window.addEventListener("DOMContentLoaded", () => {
    fetchState();
});
