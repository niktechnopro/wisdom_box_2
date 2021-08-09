import React, { useState, useEffect, Component } from "react";
import { StyleSheet, View, Dimensions, AppState } from "react-native";
import WelcomePage from "./WelcomePage";
import MainAppPage from "./MainAppPage";
import { isTTSAvailable, loadDefaultTTS } from "../utils/SpeechEngineModule";
import SettingsPage from "./SettingsPage";
import { getData, storeData, removeData } from "../utils/PersistentStorage";


class AppWrapper extends Component{
  constructor(props){
    super(props);
    this.state={
      page: "WelcomePage",
      isSpeechEngineDetected: true,
      appState: AppState.currentState,
      dimensions: {...Dimensions.get('window'), isLandscape: false},
      shouldShowSettings: false,
    },
    this.isFirstLoad = true;
  }


  componentDidMount = () => {
    // removeData("isFirstLoad");//just for testing - to remove the key if needed
    isTTSAvailable()//checking if speach engine is available
    .then((result) => {
      if(result === "success"){
        loadDefaultTTS();
        this.setState({isSpeechEngineDetected: true});
      }
      else{
        this.setState({isSpeechEngineDetected: false});
      }
    })
    .catch(error => {//not in documentation
      console.log("speech engine error: ", error);
      this.setState({isSpeechEngineDetected: false});
    })

    //check if this is the first load and set the flag if it is
    this.checkIfFirstLoad();

    //appState listener setup
    AppState.addEventListener('change', this.onAppStateChange);
    Dimensions.addEventListener('change', this.onDimensionsChange);
  }

  checkIfFirstLoad = () => {//set the flag on first load
    getData("isFirstLoad")
      .then(result => {
      // console.log("isFirstLoad: ", result)
        if(result){
          this.isFirstLoad = false;//setting this flag to <false> will redirect flow to MainAppPage
        }
        else{
          console.log("no records found - load SettingsPage and set the flag");
          //we can make a record - so the next time the APK would go to MainAppPage
          this.isFirstLoad = true;
          storeData("isFirstLoad", true);//store it in memory and do not show the settings screen after Welcome again
        }
    })
  }

  componentWillUnmount = () => {
    AppState.removeEventListener('change', this.onAppStateChange);
    Dimensions.removeEventListener('change', this.onDimensionsChange);
  }

  onAppStateChange = (nextAppState) => {
    this.setState({appState: nextAppState});
  }

  onDimensionsChange = (dimensions) => {
    this.setState({
      dimensions: {...dimensions.window, isLandscape: dimensions.width > dimensions.height}
    })
  }

  changePageTo = (pagePointer) => {//this is sort of analogy of router
    console.log("we are in changePageTo: ", this.isFirstLoad);
    if(pagePointer === "MainAppPage"){
      if(this.isFirstLoad && this.state.isSpeechEngineDetected){//if this is first load - redirect to SettingsPage
        this.setState({
          page: "SettingsPage",
          shouldShowSettings: true,
        },()=>{
           this.isFirstLoad = false;//once first load completed - go reset the key
        })
      }
      else{
        this.setState({
          page: "MainAppPage",
          shouldShowSettings: false
        });
      }
    }
    else if(pagePointer === "SettingsPage"){
      // this.setState({page: "SettingsPage"});
      this.setState({
        shouldShowSettings : true
      })
    }
  }

  render(){
    const { page, isSpeechEngineDetected, appState, dimensions, shouldShowSettings } = this.state;
    // console.log("this.state: ", this.state)
    return(
      <View
        style={styles.appWrapper}
      >
          {
            (page === "WelcomePage") && 
            <WelcomePage 
              dimensions = {dimensions}
              pageChange = {this.changePageTo}
            />
          }
          {
            (page === "MainAppPage") && 
              <MainAppPage 
                dimensions = {dimensions}
                pageChange = {this.changePageTo}
                isSpeechEngineDetected = {isSpeechEngineDetected}
                appState={appState}
                shouldShowSettings={shouldShowSettings}
              />
          }
          {
            (shouldShowSettings || (page === "SettingsPage")) && isSpeechEngineDetected && 
              <SettingsPage 
                dimensions = {dimensions}
                pageChange = {this.changePageTo}
                isSpeechEngineDetected = {isSpeechEngineDetected}
              /> 
          }
      </View>
    )
  }
} 

export default AppWrapper;

const styles = StyleSheet.create({
	appWrapper:{
    height: "100%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center"
  }
});

