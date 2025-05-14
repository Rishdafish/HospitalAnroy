import os 
import time 
import json 
from flask import Flask, request, jsonify
from pydub import AudioSegment
import torch
import librosa 
from transformers import AutoProcessor, AutoModelForSpeechSeq2Seq, AutoModelForCausalLM, AutoTokenizer
app = Flask(__name__)

Audioprocessor = AutoProcessor.from_pretrained("openai/whisper-large-v3-turbo")
Audiomodel = AutoModelForSpeechSeq2Seq.from_pretrained("openai/whisper-large-v3-turbo")
Textmodel = AutoModelForCausalLM.from_pretrained("RWKV/rwkv-4-1b5-pile", torch_dtype="auto")
Texttokenizer = AutoTokenizer.from_pretrained("RWKV/rwkv-4-1b5-pile")

name = ""
disorders = []
template = ""
isLive = False
audioParts = []


ListAudio = {
    "Parts":{
        
    },
    "Totaltext": {
        
    },
    "Summary": {
        
    },
}

lastSpokenSentence = ""

def audioToText(audioPath): 
    audio = (librosa.load(audioPath, sr=16_000))[0]
    modelInputs = Audioprocessor(audio, sampling_rate=16_000, return_tensors="pt", language="en")
    with torch.no_grad():
        predicted_ids = Audiomodel.generate(modelInputs.input_features)
    transcription = Audioprocessor.batch_decode(predicted_ids, skip_special_tokens=True)
    return transcription[0]

def getTranscript():
    pass 
def getSummary():
    pass 
def addAudio(newAudioPath):
    pass



@app.route('/startSession', methods=['POST'])
def startSession():
  tname = request.json['name']
  tdisorders = request.json['disorders']
  ttemplate = request.json['template']
  tlive = request.form['isLive']
  name = tname
  disorders = tdisorders
  template = ttemplate
  isLive = tlive


@app.route('/addAudio', methods=['POST'])
def addAudio():
  pass

@app.route('/endSession', methods=['POST'])
def endSession():
  pass

@app.route('/pastMainText', methods=["GET"])
def postMainText():
  pass