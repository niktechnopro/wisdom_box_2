import Tts from 'react-native-tts';
import { storeData, getData } from "./PersistentStorage";

export const defaults = {
    language: 'en-IE',
    rate: 0.6,
    pitch: 1.0,
    voice: ""
};

//set defaults based on the voices found on machine
export const resetVoiceToDefault = () => {
    getAvailableVoices()
    .then(result => {
        if(result.length > 0){
            defaults.language = result[0].language;
            defaults.voice = result[0].name;
            setDefaultTTS();
        }
        else{
            throw new Error("no voices found");
        }
    })
    .catch(error => {
        console.log("error retrieving available voices: ", error?.message);
    })
}

export const isTTSAvailable = () => {//detects if speech engine available or not
    return  Tts.getInitStatus();//returning a promise
}

export const setDefaultTTS = () => {
    Tts.setDefaultLanguage(defaults.language);
    Tts.setDefaultRate(defaults.rate);
    Tts.setDefaultPitch(defaults.pitch);
    Tts.setDefaultVoice(defaults.voice);//says that default voice was not found
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
        }
        else{//place logic on detecting voices and setting default voice right here.
            resetVoiceToDefault();
        }
    });
}

export const speakerTts = (quote) => {
    Tts.stop();
    Tts.speak(quote);
}

export const getAvailableVoices = async () => {//getting voices available on system - will limit to 8 for now
    return await Tts.voices()
    .then(result => {
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


//1.detect speech engine
//2.if engine detected - read the first 8 voices
//3.choose the very first one and set it a default

