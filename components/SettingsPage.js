import React, { Component } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated
} from "react-native";
import Slider from '@react-native-community/slider';
import { isTTSAvailable, setDefaultTTS, getAvailableVoices, setVoiceParameters, speakerTts, saveDefaults, defaults } from "../utils/SpeechEngineModule";

const AvailableVoices = ({voices, setSelectedVoice}) => {
    return(  
        <View style={styles.voicesBox}>    
            {voices.map((value, idx) => {
                return(
                    <TouchableOpacity
                        key = {value.id}
                        style = {styles.voiceCell}
                        onPress = {() => setSelectedVoice(value.id)}>
                        <Text  style = {styles.voiceText}>{idx+1}.</Text>   
                        <Text style = {styles.voiceText}>
                            {value.language}
                        </Text>
                        <Text style = {styles.voiceText}>
                            {(value.id.split("#")[1] ? "  " + value.id.split("#")[1] : "")}
                        </Text>
                    </TouchableOpacity>
                )
            })}
        </View>
    )
}

const Button = ({text, onPress}) => {
    return(
        <TouchableOpacity
            style = {styles.button}
            onPress = {onPress}>
            <Text style = {styles.buttonText}>
                {text}
            </Text>
        </TouchableOpacity>
    )
}

export default class SettingsPage extends Component{
	constructor(props){
		super(props)
		this.state = {
			voices: [],
			ttsStatus: "initializing",
			selectedVoice: "en-US",
            voices: [],
			speechRate: defaults.rate,
			speechPitch: defaults.pitch,
		}
        this.fadeAnimation = new Animated.Value(0);
	}

    componentDidMount = () => {
        this.checkSpeechEngineAvailability();
        this.setVoices();
        Animated.timing(
            this.fadeAnimation,
            {
              toValue: 1,
              duration: 800,
              useNativeDriver: true
            }
        ).start();
    }

    checkSpeechEngineAvailability = () => {
        isTTSAvailable()
        .then(result => {
            if(result === "success"){
                this.setState({
                    ttsStatus: "detected"
                })
            }
            else{
                this.setState({
                    ttsStatus: "not detected"
                })
            }
        })
    }

    setVoices = () => {
        getAvailableVoices()
        .then(res => {//if voices found - set it up
            // console.log("res: ", res);
            if(res?.length > 0){
                this.setState({ 
                    voices: res,
                    selectedVoice: res[0].name
                });//set available languate list
            }
        })
    }

    setVoice = (voice_id) => {
        this.setState({ selectedVoice: voice_id},()=>{
            setVoiceParameters(null, null, voice_id);
        })
    }

    setVoiceRate = (rate) => {
        this.setState({speechRate: rate},() => {
            setVoiceParameters(rate, null, null);
        })
    }

    setVoicePitch = (pitch) => {
        this.setState({speechPitch: pitch},() => {
            setVoiceParameters(null, pitch, null);
        })
    }

    onButtonPress = (action) => {
        switch(action){
            case "reset":
                this.setState({
                    speechRate: defaults.rate,
			        speechPitch: defaults.pitch,
                },()=>{
                    this.setVoices();
                    setDefaultTTS();
                })
                break;
            default:
                Animated.timing(
                    this.fadeAnimation,
                    {
                      toValue: 0,
                      duration: 800,
                      useNativeDriver: true
                    }
                ).start(()=>{
                    saveDefaults();//save defaults for next APP load
                    this.props.pageChange("MainAppPage");
                });
                break;
        }
    }

    render(){
        const {dimensions} = this.props;
        const sliderWidth = dimensions.width * 0.85;
        // this.slideAnimation = new Animated.Value(-props.dimensions.height);
        return(
            <Animated.View
                style={[styles.container, 
                    {opacity: this.fadeAnimation},
                    {transform: [{ translateY: this.fadeAnimation.interpolate({ inputRange: [0, 1], outputRange: [ -this.props.dimensions.height, 0]}) }]}
                ]}
            > 
                    <ScrollView>
                        <Text style={styles.title}>Quick Set Up</Text>
                        <Text style={styles.label}>Speech Engine: {this.state.ttsStatus}</Text>
                        <View style={[styles.sliderContainer, {width: sliderWidth}]}>
                            <Text
                                style={[styles.label, {width: "30%"}]}
                                >
                                    Rate: 
                            </Text>
                            <Slider
                                style={{flex: 1, transform:[{ scale: 2 }]}}
                                minimumValue={0.01}
                                maximumValue={1}
                                value={this.state.speechRate}
                                minimumTrackTintColor="rgba(0, 122, 255, 0.5)"
                                maximumTrackTintColor="#000000"
                                onSlidingComplete={this.setVoiceRate}
                            />
                        </View>
                        <View style={styles.sliderContainer}>
                            <Text
                                style={[styles.label, {width: "30%"}]}
                                >
                                    Pitch: 
                            </Text>
                            <Slider
                                style={{flex: 1, transform:[{ scale: 2 }]}}
                                minimumValue={0.1}
                                maximumValue={2}
                                value={this.state.speechPitch}
                                minimumTrackTintColor="rgba(0, 122, 255, 0.5)"
                                maximumTrackTintColor="#000000"
                                onSlidingComplete={this.setVoicePitch}
                            />
                        </View>
                        <View style={{flex: 1}}>
				          	<Text
				            style={[styles.title, {fontSize: 30}]}
				          	>
                                Available Voices
				          	</Text>
			          	</View>
                        <View style={styles.selectedVoiceContainer}>
				          	<Text
				            style={styles.subLabel}
				          	>
                                selected voice: {this.state.selectedVoice}
				          	</Text>
			          	</View>
                        {this.state.voices.length > 0 && 
                        <AvailableVoices 
                            voices={this.state.voices}
                            setSelectedVoice={this.setVoice}
                        />}
                        <View style={{flexDirection: "row", justifyContent: "space-around"}}>
                            <Button 
                                onPress={()=>this.onButtonPress("reset")}
                                text="Reset"
                            />
                            <Button 
                                onPress={()=>this.onButtonPress("save")}
                                text="Save/Go"
                            />
                        </View>
                </ScrollView>
            </Animated.View>
        )
    }

}

const styles = StyleSheet.create({
	container: {
		flex: 1,
        width: "100%",
		alignItems: 'center',
        justifyContent: "center",
		backgroundColor: "#F5FCFF",
		paddingBottom: 50
	},
    title:{
		padding: 10,
    	fontSize: 45,
    	color: 'rgba(0, 122, 255, 1)',
    	fontWeight: "bold",
    	textShadowColor: 'rgba(99, 99, 99, 0.75)',
    	textShadowOffset: {width: -3, height: 2},
    	textShadowRadius: 10,
    	textAlign: 'center'
	},
    label: {
    	textAlign: "center",
    	padding: 10,
    	fontSize: 20,
    	fontWeight: "bold",
  	},
    sliderContainer: {
    	flexDirection: "row",
    	justifyContent: "space-between",
    	alignItems: "center",
        margin: 15,
  	},
    voicesBox: {
        flex: 1,
        borderWidth:5,
        borderColor: 'rgba(0, 122, 255, 0.7)',
        borderRadius: 10
    },
    voiceCell:{
        backgroundColor: 'rgba(0, 122, 255, 0.1)',
        paddingVertical: 10,
        paddingLeft: 20,
        borderWidth: 1,
        borderColor: 'rgba(0, 122, 255, 0.5)',
        flexDirection: "row",
        justifyContent: "flex-start"
    },
    voiceText: {
        fontWeight: "bold",
        fontSize: 19,
        color: '#4f603c',
    },
    subLabel:{
        textAlign: "left",
        padding: 4,
        fontSize: 18,
        fontWeight: "bold"
    },
    selectedVoiceContainer: {
        height: 50, 
        flexDirection: "row", 
        justifyContent: "center", 
        alignItems: "center"
    },
    button: {
        alignItems: 'center',
        padding: 15,
        justifyContent: 'center', 
        backgroundColor: 'rgba(0, 122, 255, 1)',
        borderRadius: 30,
        borderColor: '#fff',
        borderWidth: 2,
        shadowRadius: 3,
        shadowOpacity: 1,
        shadowColor: 'rgba(0, 0, 0, 0.4)',
        shadowOffset: {
            width: 0,
            height: 1
        },
        marginVertical: 20,
    },
    buttonText:{
        fontSize: 30,
        color: '#fff',
        fontWeight: "bold",
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: {width: -1, height: 1},
        textShadowRadius: 10
    },
})
