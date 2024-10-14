import React, { useState } from 'react';
import { View, Button, Text, PermissionsAndroid, Platform } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import axios from 'axios';
import RNFS from 'react-native-fs';

const App = () => {
  const [recording, setRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [translation, setTranslation] = useState('');
  const audioRecorderPlayer = new AudioRecorderPlayer();

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ]);
        return granted;
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const startRecording = async () => {
    await requestPermissions();
    const result = await audioRecorderPlayer.startRecorder();
    setRecording(true);
    console.log("Recording started:", result);  // Logging the recording path
  };

  const stopRecording = async () => {
    const result = await audioRecorderPlayer.stopRecorder();
    setRecording(false);
    console.log("Recording stopped:", result);  // Log the path to the audio file

    // Convert file path to base64 format to send it via axios
    const base64Audio = await RNFS.readFile(result, 'base64');

    // Create form data for the request
    const formData = new FormData();
    formData.append('audio', {
      uri: `data:audio/wav;base64,${base64Audio}`,  // Use base64 for sending the audio
      type: 'audio/wav',
      name: 'speech.wav',
    });

    console.log("Sending audio file to server...");

    // Send the audio file to the backend for processing
    axios.post('http://your-ip-address:5000/recognize_speech', formData)
      .then(response => {
        console.log("Server response:", response.data);  // Log server response for debugging
        setTranscription(response.data.original_text);
        setTranslation(response.data.translated_text);
      })
      .catch(error => console.error("Error during API request:", error));  // Log any errors
  };

  return (
    <View>
      <Button title={recording ? 'Stop Recording' : 'Start Recording'} onPress={recording ? stopRecording : startRecording} />
      <Text>Transcription: {transcription}</Text>
      <Text>Translation: {translation}</Text>
    </View>
  );
};

export default App;
