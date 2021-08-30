import Tts from 'react-native-tts';
import { storeData, getData, removeData } from "./PersistentStorage";

//1.detect speech engine
//2.if engine detected - read the first <numbe voices> voices
//3.choose the very first one and set it a default

export const defaults = {
    language: "",
    rate: 0.6,
    pitch: 1.0,
    voice: ""
};

export let userChoice = {
    language: "",
    rate: 0.6,
    pitch: 1.0,
    voice: ""
};

//set defaults based on the voices found on machine
export const resetVoiceToDefault = (isResetButtonPressed) => {
    return getAvailableVoices()
    .then(result => {
        if(result.length > 0){//check if something in the array
            defaults.language = result[0].language;
            defaults.voice = result[0].name;
            setDefaultTTS(null, isResetButtonPressed);
        }
        else{
            throw new Error("no voices found");
        }
    })
    .catch(error => {
        console.log("error retrieving available voices: ", error?.message);
    })
};

export const isTTSAvailable = () => {//detects if speech engine available or not
    return  Tts.getInitStatus();//returning a promise
};

export const setDefaultTTS = (isUserChoice, isResetButtonPressed) => {
    if(isUserChoice){//set to userChoice
        Tts.setDefaultLanguage(userChoice.language);
        Tts.setDefaultRate(userChoice.rate);
        Tts.setDefaultPitch(userChoice.pitch);
        Tts.setDefaultVoice(userChoice.voice);//says that default voice was not found
        Tts.setDucking(true);
        Tts.setIgnoreSilentSwitch("ignore");//this is for iOS
    }
    else{//reset to defaults
        Tts.setDefaultLanguage(defaults.language);
        Tts.setDefaultRate(defaults.rate);
        Tts.setDefaultPitch(defaults.pitch);
        Tts.setDefaultVoice(defaults.voice);//says that default voice was not found
        Tts.setDucking(true);
        Tts.setIgnoreSilentSwitch("ignore");//this is for iOS
        userChoice = {
            language: "",
            rate: 0.6,
            pitch: 1.0,
            voice: "" 
        };
        if(isResetButtonPressed){
            speakerTts("this is how I talk");//test speech
        }
    }
};

//called from AppWrapper on load
export const loadDefaultTTS = () => {
    getData("tts")//checks if any user data was saved
    .then(result => {
        //if something in results - load it, else - resetDefault TTS
        if(result){
            // console.log("result, option 1: ", result)
            userChoice = JSON.parse(result);
            if(userChoice.voice) setDefaultTTS(true);
        }
        else{
            resetVoiceToDefault();
        }
    });
};

export const speakerTts = (quote) => {
    Tts.stop();
    Tts.speak(quote);
}

export const getAvailableVoices = async () => {//getting voices available on system - will limit to 8 for now
    return await Tts.voices()
    .then(result => {
        return result.filter((value) => (value.notInstalled === false) && (value.networkConnectionRequired === false) && (new RegExp("en").test(value.language))).slice(0,9);
    })
};


export const setVoiceParameters = (rate, pitch, voice_id, language) => {
    if(rate){
        userChoice.rate = rate;
        Tts.setDefaultRate(rate);
    }
    if(pitch){
        userChoice.pitch = pitch;
        Tts.setDefaultPitch(pitch);
    }
    if(voice_id){
        // console.log("voice_id: ", voice_id);
        userChoice.voice = voice_id;
        userChoice.language = language;
        Tts.setDefaultVoice(voice_id);
        Tts.setDefaultLanguage(language);
    }
    speakerTts("this is how I talk");//test speech
};

export const saveUserChoice = () => {
    if(!userChoice.voice){//that means the voice is stil default
        userChoice.voice = defaults.voice;
    }
    if(!userChoice.language){//that means the language is still default
        userChoice.language = defaults.language;
    }
    storeData("tts", userChoice);
};

export const resetToDefaults = () => {
    removeData("tts");
    return resetVoiceToDefault(true);//boolean <true> would correspond to reset button
};

export const stopSpeach = () => {
    Tts.stop();
}



