
"""
morse_engine.py
----------------
Pure logic for the MorseGlove web assistive communication app.
Contains the state machine for Dot/Dash entry, spacing, message clearing,
and interactive tutorial navigation.
"""

import string

LETTER_TO_MORSE = {
    "A": ".-",    "B": "-...",  "C": "-.-.",  "D": "-..",   "E": ".",
    "F": "..-.",  "G": "--.",   "H": "....",  "I": "..",    "J": ".---",
    "K": "-.-",   "L": ".-..",  "M": "--",    "N": "-.",    "O": "---",
    "P": ".--.",  "Q": "--.-",  "R": ".-.",   "S": "...",   "T": "-",
    "U": "..-",   "V": "...-",  "W": ".--",   "X": "-..-",  "Y": "-.--",
    "Z": "--..",
    "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-",
    "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.",
}

MORSE_TO_LETTER = {v: k for k, v in LETTER_TO_MORSE.items()}
UNKNOWN_SYMBOL = "?"  # shown/spoken when a pattern doesn't match


class MorseEngine:
    def __init__(self):
        # symbols ('.' or '-') entered for the character currently being built
        self.current_pattern = []
        # full decoded message built so far
        self.message = ""
        # tutorial state
        self.alphabet = list(string.ascii_uppercase)
        self.tutorial_index = 0
        self.tutorial_active = False

    def press_dot(self):
        self.current_pattern.append(".")
        return "."

    def press_dash(self):
        self.current_pattern.append("-")
        return "-"

    def get_pattern_string(self):
        return "".join(self.current_pattern)

    def press_space(self):
        if self.current_pattern:
            pattern = self.get_pattern_string()
            letter = MORSE_TO_LETTER.get(pattern, UNKNOWN_SYMBOL)
            self.message += letter
            self.current_pattern = []
            return letter
        else:
            if self.message and not self.message.endswith(" "):
                self.message += " "
            return " "

    def backspace(self):
        if self.current_pattern:
            return self.current_pattern.pop()
        elif self.message:
            removed = self.message[-1]
            self.message = self.message[:-1]
            return removed
        return None

    def get_message(self):
        return self.message

    def clear_message(self):
        self.message = ""
        self.current_pattern = []

    def tutorial_toggle(self):
        self.tutorial_active = not self.tutorial_active
        if self.tutorial_active:
            self.tutorial_index = 0
        return self.tutorial_active

    def tutorial_next(self):
        self.tutorial_index = (self.tutorial_index + 1) % len(self.alphabet)
        return self.tutorial_current_letter()

    def tutorial_previous(self):
        self.tutorial_index = (self.tutorial_index - 1) % len(self.alphabet)
        return self.tutorial_current_letter()

    def tutorial_current_letter(self):
        return self.alphabet[self.tutorial_index]

    def tutorial_current_pattern(self):
        return LETTER_TO_MORSE[self.tutorial_current_letter()]

    def get_state(self):
        return {
            "current_pattern": self.get_pattern_string(),
            "message": self.message,
            "tutorial_active": self.tutorial_active,
            "tutorial_letter": self.tutorial_current_letter() if self.tutorial_active else None,
            "tutorial_pattern": self.tutorial_current_pattern() if self.tutorial_active else None,
        }
