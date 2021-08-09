import Tts from 'react-native-tts';
import { storeData, getData } from "./PersistentStorage";

export const defaults = {
    language: 'en-IE',
    rate: 0.6,
    pitch: 1.0,
    voice: "en-us-x-sfg#male_2-local"
};

//set defaults based on the voices found on machine

export const isTTSAvailable = () => {
    return  Tts.getInitStatus();//returning a promise
}

export const setDefaultTTS = () => {
    Tts.setDefaultLanguage("en-IE");
    Tts.setDefaultRate(0.6);
    Tts.setDefaultPitch(1.0);
    Tts.setDefaultVoice("en-us-x-sfg#male_2-local");
    Tts.setDucking(true);
    Tts.setIgnoreSilentSwitch("ignore");
}

export const loadDefaultTTS = () => {
    // console.log("loadDefaultTTS: ")
    getData("tts")
    .then(result => {
        // console.log("result: ", result);
        if(result){//if something in results - load it, else - resetDefault TTS
            defaults = JSON.parse(result);
            // console.log("use this result object: ", defaults);
        }
        else{
            setDefaultTTS();
        }
    });
}

export const speakerTts = (quote) => {
    Tts.stop();
    Tts.speak(quote);
}

export const getAvailableVoices = async () => {
    return await Tts.voices()
    .then(result => {
        console.log("voices available: ", result);
        return result.filter((value) => (value.notInstalled === false) && (value.networkConnectionRequired === false) && (new RegExp("en").test(value.language))).slice(0,8);
    })
}


export const setVoiceParameters = (rate, pitch, voice_id) => {
    if(rate){
        defaults.rate = rate;
        Tts.setDefaultRate(rate);
    }
    if(pitch){
        defaults.pitch = pitch;
        Tts.setDefaultPitch(pitch);
    }
    if(voice_id){
        // console.log("voice_id: ", voice_id);
        defaults.voice = voice_id;
        Tts.setDefaultVoice(voice_id);
    }
    speakerTts("this is how I talk");//test speech
}

export const saveDefaults = () => {
    // console.log("defaults: ", defaults)
    storeData("tts", defaults);
}

