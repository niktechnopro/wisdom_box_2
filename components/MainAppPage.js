import React, { Component } from "react";
import { StyleSheet, Text, View, Animated, Easing, ImageBackground, Image, TouchableOpacity, 
    Switch, BackHandler } from "react-native";
import * as Animatable from 'react-native-animatable';
import quoteblob from "../assets/quoteblob";
import { setAnimations } from "../utils/AnimationHelper";
import Icon from 'react-native-vector-icons/FontAwesome';
import { defaults, speakerTts, userChoice } from "../utils/SpeechEngineModule";
import BackgroundTimer from 'react-native-background-timer';

const interval = 12000; //I'll start with 12 sec interval

const Button = ({getNewQuote, disabled, isPortrait}) => {
    return(
        <TouchableOpacity//after playing with Pressable component I decided not to use it here
            disabled={disabled}
            style={[styles.button, disabled && {backgroundColor: "#fff"}, {marginTop: isPortrait ? 20 : 5}]}
            onPress = {getNewQuote}
        >
            <Text style={styles.buttonText}>{disabled ? "Disabled" : "Get a Quote"}</Text>
        </TouchableOpacity>
    )
}

class MainAppPage extends Component{
    constructor(props){
        super(props)
        this.state = {
            quote: "Press 'Get a Quote' button",
            author: "",
            animation: null,
            direction: "normal",
            width: 0,
            switchValue: false,
            isDisabled: false,
            isPortrait: true //default
        }
        this.authorRef = React.createRef();
        this.quoteRef = React.createRef();
        this.modeText = React.createRef();
        this.quoteIntervalTimer = null;
        this.appState = "active";//default value
        this.backgroundQuotesHelper = [...quoteblob];
        this.quote = "";
        this.author = "";
    }

    componentDidMount = () => {
        BackHandler.addEventListener('hardwareBackPress', () => true);//disables hardware back button
        this.props.isSpeechEngineDetected && speakerTts(this.state.quote);//first fraze
        if(this.props.dimensions.height < this.props.dimensions.width){//resets to landscape mode if user holds it like that on start
            this.setState({
                isPortrait: false
            })
        }
    }

    componentWillUnmount = () => {
        BackHandler.removeEventListener('hardwareBackPress', () => true);
        this.quoteIntervalTimer && BackgroundTimer.clearInterval(this.quoteIntervalTimer);
        this.quoteIntervalTimer = null;
    }

    componentDidUpdate = (prevProps, prevState) => {
        if(this.props.appState !== prevProps.appState){
            // console.log("appState has changed to: ", this.props.appState);
            this.appState = this.props.appState;
            //next I am going to sync this.backgroundQuotesHelper to this.state.quotes
            if(this.appState === "active" && prevProps.appState !== "active"){//from background
                this.setState({//sync quotes and current quote when coming back from background
                    quote: this.quote ? this.quote : this.state.quote,
                    author: this.author ? this.author : this.state.author
                },() => {
                    let animation = setAnimations();
                    this.quoteRef?.current[`${animation.animationsIn}`](750)
                    this.state.author && this.authorRef?.current[`${animation.autAnimationIn}`](950)
                });
            }
        }
        //should only run if this.state.isDisabled = true, when coming back and timer is null - relaunch it
        if(this.state.isDisabled && !this.quoteIntervalTimer && prevProps.shouldShowSettings && !this.props.shouldShowSettings){
            //relaunch auto - timer
            this.quoteAutoTimer();
        }
        //to check if Vertical
        if(prevProps.dimensions.height !== this.props.dimensions.height){//detecting if phone isLandscape or not
            if(this.props.dimensions.height > prevProps.dimensions.height){
                this.setState({
                    isPortrait: true
                })
            }
            else{
                this.setState({
                    isPortrait: false
                })
            }
        }
    }

    // shouldComponentUpdate = (nextProps, nextState) => {
    //     return true;
    // }

    randromIndexGenerator = () => {
        // source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
        return Math.floor(Math.random()*this.backgroundQuotesHelper.length);
    }

    startQuoteAnimations = () => {
        let animation = setAnimations();
        if(this.backgroundQuotesHelper.length > 0 && this.quoteRef.current && this.authorRef.current){
            this.quoteRef.current[`${animation.animationsOut}`](650)
            .then(({finished}) => {
                this.newQuoteSelector(animation.animationsIn, animation.autAnimationIn);
            })
            .catch(error => console.log("animation did not work"));//comment out
            if(this.state.author){//only run it if author defined
                this.authorRef.current[`${animation.autAnimationOut}`](750)
            }
        }
        else if(this.backgroundQuotesHelper.length === 0){//reset qouotes and starts over
            this.backgroundQuotesHelper = [...quoteblob];
            this.startQuoteAnimations();
        }
    }

    newQuoteSelector = (quoteAnimationIn, authorAnimationIn) => {
        //TODO:
        // generate random index and retrieve the quote from quoteblob
        // add this index into array of already used selectedIndexes
        // retrieve the quote and render it on screen
        let idx = this.randromIndexGenerator();
        // console.log("quotes", this.backgroundQuotesHelper, idx)
        if((idx < this.backgroundQuotesHelper.length) && this.backgroundQuotesHelper.length>0){//just an extra precaution
            this.setState({
                quote: this.backgroundQuotesHelper[idx].quote,
                author: this.backgroundQuotesHelper[idx].author,
            },()=>{
                if(idx === this.backgroundQuotesHelper.length - 1){//for last idx
                    this.backgroundQuotesHelper = [...this.backgroundQuotesHelper.slice(0, idx)];
                }
                else{
                    this.backgroundQuotesHelper = [...this.backgroundQuotesHelper.slice(0, idx), ...this.backgroundQuotesHelper.slice(idx+1)]
                }
                if(this.quoteRef.current && this.authorRef.current){
                    this.quoteRef.current[`${quoteAnimationIn}`](750)
                    .then(({finished}) => {
                        // console.log(finished)
                        this.props.isSpeechEngineDetected && speakerTts(this.state.quote + ". quote bY. " + this.state.author);
                    })
                    this.authorRef.current[`${authorAnimationIn}`](950)
                }  
            })
        }
        else if(this.backgroundQuotesHelper.length > 0){//repeat selection
            this.newQuoteSelector();
        }
        else if(this.backgroundQuotesHelper.length === 0){//reset qouotes and starts over
            this.backgroundQuotesHelper = [...quoteblob];
            this.newQuoteSelector();
        }
    }

    backgroundQuoteSelector = () => {
        let animation = setAnimations();
        let idx = this.randromIndexGenerator();
        // console.log("quotes from backgroundQuoteSelector", this.backgroundQuotesHelper);
        if((idx < this.backgroundQuotesHelper.length) && this.backgroundQuotesHelper.length>0){//just an extra precaution
            this.quote = this.backgroundQuotesHelper[idx].quote;
            this.author= this.backgroundQuotesHelper[idx].author;
            if(idx === this.backgroundQuotesHelper.length - 1){//for last idx
                this.backgroundQuotesHelper = [...this.backgroundQuotesHelper.slice(0, idx)];
            }
            else{
                this.backgroundQuotesHelper = [...this.backgroundQuotesHelper.slice(0, idx), ...this.backgroundQuotesHelper.slice(idx+1)]
            }
            this.props.isSpeechEngineDetected && speakerTts(this.quote + ". quote bY. " + this.author);
        }
        else if(this.backgroundQuotesHelper.length > 0){//repeat selection
            this.backgroundQuoteSelector();
        }
        else if(this.backgroundQuotesHelper.length === 0){//reset qouotes and starts over
            this.backgroundQuotesHelper = [...quoteblob];
            this.backgroundQuoteSelector();
        }
    }

    setWidth = ({nativeEvent}) => {
        this.setState({width: nativeEvent.layout.width})
    }

    quoteAutoTimer = () => {
        this.startQuoteAnimations();
        this.quoteIntervalTimer = BackgroundTimer.setInterval(()=>{
            // console.log("run some logic here evenry " + (interval/1000) + " sec");
            if(this.appState === "active"){
                this.startQuoteAnimations();
            }
            else{
                this.backgroundQuoteSelector();
            }
        }, interval);
    }

    switchHandler = () => {
        this.setState(function(prevState){
            return{
                switchValue: !prevState.switchValue
            }
        },()=>{
            this.modeText.current && this.modeText.current.bounceInLeft();
            if(this.state.switchValue){
                this.setState({//turn button off
                    isDisabled: true
                },()=>{
                    this.quoteAutoTimer();
                });
            }
            else{
                this.quoteIntervalTimer && BackgroundTimer.clearInterval(this.quoteIntervalTimer);
                this.quoteIntervalTimer = null;
                this.setState({isDisabled: false});//turn button back on
            }
        })
    }

    exitAppAction = () => {
        BackHandler.exitApp();
    }

    goToSettings = () => {
        if(this.state.isDisabled){
            this.quoteIntervalTimer && BackgroundTimer.clearInterval(this.quoteIntervalTimer);
            this.quoteIntervalTimer = null;
        }
        this.props.pageChange("SettingsPage");
    }
  
    render(){
        const {dimensions, shouldShowSettings} = this.props;
        // console.log("defaults: ", defaults);
        // console.log("userChoice: ", userChoice);
        
        return(
            <Animated.View 
                style={[
                    styles.wrapper,
                    shouldShowSettings && {display: "none"} 
                ]}
            >
                <ImageBackground
                    source = {require("../assets/flower.jpg")}
                    style = {[styles.wrapper,dimensions]}
                    imageStyle={{
                        resizeMode: 'cover'
                    }}
                >
                    <View style={{flex: 1, justifyContent: "center"}}>
                        <Text style={[styles.title]}>
                            Wisdom Box
                        </Text>
                    </View>
                    {
                        this.props.isSpeechEngineDetected && 
                        <TouchableOpacity
                            style={styles.settingsButton}
                            onPress={this.goToSettings}
                        >
                            <Icon name="cog" size={35} color="blue" />
                        </TouchableOpacity>
                    }
                    <TouchableOpacity
                        style={styles.exitButton}
                        onPress={this.exitAppAction}
                    >
                        <Icon name="sign-out" size={35} color="blue" />
                    </TouchableOpacity>
                    <View
                        style = {[styles.bookFrame, {width: "95%"}]}
                        onLayout={this.setWidth}
                    >
                        <Image
                            style={[styles.insideImage]}
                            resizeMode = {"stretch"}
                            source={require("../assets/book.jpg")}
                        />
                        <View style={[styles.wisdomTextWrap, {width: this.state.width}]}>
                            <Animatable.Text
                                ref={this.quoteRef} 
                                style={styles.wisdomText}
                                useNativeDriver={true}
                            >
                                {this.state.quote}
                            </Animatable.Text>
                        </View>
                        <View style={styles.authorBox}>
                            <Animatable.Text
                                ref={this.authorRef}
                                style={styles.author}
                                useNativeDriver={true}
                            >
                                {this.state.author}
                            </Animatable.Text>
                        </View>
                    </View>
                    <View style={styles.switchContainer}>
                        <View 
                            style={styles.itemContainer}
                        >
                            <Animatable.Text
                                ref={this.modeText} 
                                style={styles.modeText}
                                useNativeDriver={true}
                            >
                                {this.state.switchValue ? "auto mode" : "manual mode"}
                            </Animatable.Text>
                        </View>
                        <View style={styles.itemContainer}>
                            <Switch
                                trackColor={{ true: "green", false: "red" }}
                                thumbColor="blue"
                                ios_backgroundColor="#3e3e3e"
                                onValueChange={this.switchHandler}
                                value={this.state.switchValue}
                                style={{ transform:[{ scaleX: 1.5 }, { scaleY: 1.5 }] }}
                            />
                        </View>
                    </View>
                    <View style={styles.buttonFrame}>
                        <Button
                            isPortrait={this.state.isPortrait}
                            disabled={this.state.isDisabled} 
                            getNewQuote={this.startQuoteAnimations}
                        />
                    </View>
                    {this.state.isPortrait && <View style={styles.footer}>
                        <Text 
                            style={styles.fText}
                            numberOfLines={1}
                        >
                                {'\u00A9'} Fun FCC Project by Nik
                        </Text>
                    </View>}
                </ImageBackground>
            </Animated.View>
        )
    }
}

export default MainAppPage;

const styles = StyleSheet.create({
	wrapper: {
		justifyContent: 'space-around',
		alignItems: 'center',
	},
    bookFrame:{
        flex: 3,
        padding: 2,
        borderWidth: 5,
        borderRadius: 5,
        borderColor: "#fff",
        justifyContent: 'center',
        alignItems: 'center',
    },
    title:{
        fontSize: 45,
        color: '#fff',
        fontWeight: "bold",
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: {width: -1, height: 1},
        textShadowRadius: 10
    },
    insideImage:{
        height: "100%",
        width: "100%"
    },
    wisdomTextWrap:{
        position: "absolute",
        justifyContent: "center",
        alignItems: "center"
    },
    wisdomText:{
        paddingHorizontal: 10,
        paddingVertical: 5,
        fontSize: 25,
        color: '#000',
        fontWeight: "bold",
        textShadowColor: 'rgba(255, 255, 255, 0.75)',
        textShadowOffset: {width: -1, height: 1},
        textShadowRadius: 10,
        textAlign: 'justify'
    },
    authorBox:{
        position: "absolute",
        padding: 2,
        bottom: 0,
        right: 0
    },
    author:{
        padding: 10,
        fontSize: 20,
        color: '#000',
        fontWeight: "bold",
        textShadowColor: 'rgba(255, 255, 255, 0.75)',
        textShadowOffset: {width: -1, height: 1},
        textShadowRadius: 10,
        textAlign: 'right',
        fontStyle: 'italic'
    },
    buttonFrame:{
        // flex: 1,
        marginBottom: 15,
        // borderWidth: 1,
        // borderColor: "red"
    },
    button:{
        alignItems: 'center',
        padding: 10,
        justifyContent: 'center', 
        backgroundColor: 'grey',
        borderRadius: 30,
        borderColor: '#fff',
        borderWidth: 2,
        shadowRadius: 3,
        shadowOpacity: 1,
        shadowColor: 'rgba(0, 0, 0, 0.7)',
        shadowOffset: {
            width: 0,
            height: 1
        },
        marginTop: 20
    },
    buttonText:{
        fontSize: 30,
        color: '#fff',
        fontWeight: "bold",
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: {width: -1, height: 1},
        textShadowRadius: 10
    },
    switchContainer: {
        flexDirection: "row", 
        justifyContent: "space-around", 
        width: "100%", 
        backgroundColor: "rgba(255,255,255, 0.3)",
    },
    itemContainer:{
        height: 35, 
        justifyContent: "center",
    },
    modeText:{
        color: "blue", 
        fontSize: 30, 
        fontWeight: "bold"
    },
    exitButton:{
        padding: 10,
        position: "absolute",
        right: 5,
        top: 25
    },
    settingsButton:{
        padding: 10,
        position: "absolute",
        left: 5,
        top: 25
    },
    footer:{
        margin: 1,
        marginBottom: 20
    },
    fText: {
        fontSize: 24,
		// color: "#2980b6"
		color: "#fff",
		textAlign: 'center',
		textShadowColor: '#000', 
		textShadowOffset: { width: 1.5, height: 2.5 }, 
		textShadowRadius: 1
    }
})