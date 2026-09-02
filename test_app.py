import unittest
from unittest.mock import patch
import json
from app import app, engine

class MorseAssistTestCase(unittest.TestCase):
    def setUp(self):
        # Configure app for testing
        app.config['TESTING'] = True
        self.client = app.test_client()
        
        # Reset the engine state before each test
        with patch('app.engine_lock'):
            engine.clear_message()
            engine.tutorial_active = False
            engine.tutorial_index = 0

    def test_index_route(self):
        """Test index serves HTML successfully."""
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)

    def test_get_state(self):
        """Test the state endpoint returns correct default properties."""
        response = self.client.get('/api/state')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['current_pattern'], "")
        self.assertEqual(data['message'], "")
        self.assertEqual(data['tutorial_active'], False)

    def test_press_dot(self):
        """Test that Dot increases the current pattern."""
        response = self.client.post('/api/press/dot')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['current_pattern'], ".")

    def test_press_dash(self):
        """Test that Dash increases the current pattern."""
        response = self.client.post('/api/press/dash')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['current_pattern'], "-")

    def test_press_space_decodes(self):
        """Test that Space decodes an entered pattern (.- to A)."""
        # Register Dot
        self.client.post('/api/press/dot')
        # Register Dash
        self.client.post('/api/press/dash')
        
        # Send Space
        response = self.client.post('/api/press/space')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['decoded'], "A")
        self.assertEqual(data['state']['message'], "A")
        self.assertEqual(data['state']['current_pattern'], "")

    def test_press_space_word_gap(self):
        """Test that Space inserts a word space if pattern is empty."""
        # Enter "A"
        self.client.post('/api/press/dot')
        self.client.post('/api/press/dash')
        self.client.post('/api/press/space')
        
        # Space again
        response = self.client.post('/api/press/space')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['decoded'], " ")
        self.assertEqual(data['state']['message'], "A ")

    def test_backspace(self):
        """Test that Backspace reverts last input signal/character."""
        # Dot
        self.client.post('/api/press/dot')
        # Backspace signal
        response = self.client.post('/api/press/backspace')
        data = json.loads(response.data)
        self.assertEqual(data['removed'], ".")
        self.assertEqual(data['state']['current_pattern'], "")

    def test_clear_message(self):
        """Test that Clear wipes current signals and text."""
        self.client.post('/api/press/dot')
        self.client.post('/api/press/space')
        
        response = self.client.post('/api/press/clear')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['message'], "")
        self.assertEqual(data['current_pattern'], "")

    def test_tutorial_toggle_and_navigation(self):
        """Test Tutorial toggle, next, and previous behavior."""
        # Toggle On
        response = self.client.post('/api/tutorial/toggle')
        data = json.loads(response.data)
        self.assertEqual(data['tutorial_active'], True)
        self.assertEqual(data['tutorial_letter'], "A")
        self.assertEqual(data['tutorial_pattern'], ".-")

        # Next (A -> B)
        response = self.client.post('/api/tutorial/next')
        data = json.loads(response.data)
        self.assertEqual(data['tutorial_letter'], "B")
        self.assertEqual(data['tutorial_pattern'], "-...")

        # Previous (B -> A)
        response = self.client.post('/api/tutorial/prev')
        data = json.loads(response.data)
        self.assertEqual(data['tutorial_letter'], "A")

        # Wrap A -> Z on Previous
        response = self.client.post('/api/tutorial/prev')
        data = json.loads(response.data)
        self.assertEqual(data['tutorial_letter'], "Z")

    def test_tts_rendering(self):
        """Test that the TTS endpoint returns audio contents."""
        response = self.client.get('/api/tts?text=test')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(len(response.data) > 0)
        self.assertIn(response.mimetype, ["audio/mpeg", "audio/wav"])

if __name__ == '__main__':
    unittest.main()
