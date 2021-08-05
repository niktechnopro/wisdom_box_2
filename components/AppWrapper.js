import React, { useState, useEffect, Component } from "react";
import { StyleSheet, View, Dimensions, AppState } from "react-native";
import WelcomePage from "./WelcomePage";
import MainAppPage from "./MainAppPage";
import { isTTSAvailable, loadDefaultTTS } from "../utils/SpeechEngineModule";
import SettingsPage from "./SettingsPage";
import { getData, setData } from "../utils/PersistentStorage";


class AppWrapper extends Component{
  constructor(props){
    super(props);
    this.state={
      page: "WelcomePage",
      // page: "MainAppPage",
      isSpeechEngineDetected: true,
      appState: AppState.currentState,
      dimensions: {...Dimensions.get('window'), isLandscape: false},
      shouldShowSettings: false,
      isFirstLoad: true
    }
  }


  componentDidMount = () => {
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
      console.log("speech engine error");
      this.setState({isSpeechEngineDetected: false});
    })

    //check if this is the first load and set the flag if it is
    getData("isFirstLoad")
    .then(result => {
      console.log("isFirstLoad: ", result)
      if(result){
        console.log("record found - go to MainAppPage")
        this.setState({isFirstLoad: false})
      }
      else{
        console.log("no records found - load SettingsPage and set the flag");

      }
    })

    //appState listener setup
    AppState.addEventListener('change', this.onAppStateChange);
    Dimensions.addEventListener('change', this.onDimensionsChange);
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
    if(pagePointer === "MainAppPage"){
      if(this.state.isFirstLoad){//if this is first load - redirect to SettingsPage
        this.setState({
          page: "SettingsPage",
          shouldShowSettings: true
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
    const { page, isSpeechEngineDetected, appState, dimensions, shouldShowSettings, isFirstLoad } = this.state;
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
            (shouldShowSettings || (page === "SettingsPage")) && 
              <SettingsPage 
                dimensions = {dimensions}
                pageChange = {this.changePageTo}
                isFirstLoad = {isFirstLoad}
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

// As other answers already explain, hooks API was designed to provide function components with functionality that currently is available only in class components. Hooks aren't supposed to used in class components.

// const useScreenDimensions = () => {
//     const [screenData, setScreenData] = useState(Dimensions.get('screen'));
  
//     useEffect(() => {
//       const onChange = (result) => {
//         setScreenData(result.screen);
//       };
  
//       Dimensions.addEventListener('change', onChange);
  
//       return () => Dimensions.removeEventListener('change', onChange);
//     });
  
//     return {
//       ...screenData,
//       isLandscape: screenData.width > screenData.height,
//     };
// };

// const useAppState = () => {
//   const [appState, setAppState] = useState(AppState.currentState);

//   useEffect(() => {
//     const onAppStateChange = (nextAppState) => {
//       setAppState(nextAppState)
//     }
//     AppState.addEventListener('change', onAppStateChange);
//     return () => AppState.removeEventListener('change', onAppStateChange);
//   }, [appState]);
//   return appState;
// }



// const AppWrapper = () => {
//   const [page, setNextPage] = useState("WelcomePage");
//   // const [page, setNextPage] = useState("MainAppPage");
//   // const [page, setNextPage] = useState("SettingsPage");
//   const [isSpeechEngineDetected, setSpeechEngineDetected] = useState(false);
//   useEffect(() => {
//     isTTSAvailable()//checking if speach engine is available
//     .then((result) => {
//       if(result === "success"){
//         setSpeechEngineDetected(true);
//         setDefaultTTS();
//       }
//     })
//     .catch(error => {//not in documentation
//       console.log("speech engine error")
//     })
//   },[])

//   changePageTo = (pagePointer) => {//this is sort of analogy of router
//     if(pagePointer === "MainAppPage"){
//       console.log("load main page");
//       setNextPage("MainAppPage");
//     }
//     else if(pagePointer === "SettingsPage"){
//       console.log("load settings page");
//       setNextPage("SettingsPage");
//     }
//   }

// 	return(
// 		<View
//       style={styles.appWrapper}
//     >
//           {
//             (page === "WelcomePage") && 
//               <WelcomePage 
//                 dimensions = {useScreenDimensions()}
//                 pageChange = {changePageTo}
//             />}
//           {
//             (page === "MainAppPage") && 
//               <MainAppPage 
//                 dimensions = {useScreenDimensions()}
//                 pageChange = {changePageTo}
//                 isSpeechEngineDetected = {isSpeechEngineDetected}
//                 appState={useAppState()}
//               />
//           }
//           {
//             (page === "SettingsPage") && 
//               <SettingsPage 
//                 dimensions = {useScreenDimensions()}
//                 pageChange = {changePageTo}
//               />
//           }
// 		</View>
// 	)
// } 

// const screenDimensions = useScreenDimensions();
// console.log("screenDimensions: ", screenDimensions);