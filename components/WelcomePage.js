//I'll use WelcomPage in place of LoginPage.js
import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, View, Animated, Easing } from "react-native";


const AnimatedProgressBar = ({setProgress, available_width}) => {
	
	const progress = useRef(new Animated.Value(0)).current;

	const [width, setWidth] = useState(available_width); 

	const animation = () => {
		Animated.timing(
			progress,
			{
				toValue: 1,
				duration: 6000,
				easing: Easing.linear,
				useNativeDriver: false,//can not have true, because using interpolation and property, not supported, use react-native-reanimated for performance
			}
		).start();
	}

	useEffect(()=>{//on initial load
		setWidth(available_width);
		animation();
	},[])

	useEffect(()=>{//in case if width changed
		//in case if available_width changed - reset animation
		setWidth(available_width);
		progress.stopAnimation();
		progress.setValue(0);
		animation();
	},[available_width])

	const animatedProgress = () => {
		const animated_width = progress.interpolate({
			inputRange: [0, 0.5, 1],
			outputRange: [0, width / 2, width - 12]//6 is a border width of container View
		});
		//red -> orange -> green
		const color_animation = progress.interpolate({
			inputRange: [0, 0.5, 1],
			outputRange: ["rgb(101, 203, 25)", "rgb(224, 150, 39)", "rgba(0, 122, 255, 1)"]
		});
	
		return {
			height: 30,
			width: animated_width,
			backgroundColor: color_animation
		}
	}

	const conditionToMove = ({nativeEvent}) => {
		if(nativeEvent.layout.width >= Math.floor(width - 12)){
			setProgress(true);
		}
	}

    return(
		<View style={[styles.progress_container, {width}]}>
			<Animated.View
				onLayout={(e)=>conditionToMove(e)}
				style={animatedProgress()}
			/>	
		</View>
    )
}

const PulsingDots = ({isLandscape}) => {
	const dotScales = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];//setting the array of start points for each dot

	useEffect(()=>{//call it on mount
		dotsAnimation();
	},[]);

	useEffect(()=>{//re-call it on screen orientation change
		dotsAnimation();
	},[isLandscape]);

	const dotsAnimation = () => {
		function seq(idx) {//animation for 1 dot
			return Animated.sequence([
				Animated.timing(dotScales[idx], {
					toValue: 1,
					duration: 150,
					delay: (idx + 1) * 150,
					easing: Easing.linear,
					useNativeDriver: true
				}),
				Animated.timing(dotScales[idx],{ 
					toValue: 0.3, 
					duration: 200, 
					delay: 20,
					easing: Easing.linear,
					useNativeDriver: true 
				})
			]);
		}

		Animated.loop(
			Animated.parallel([
				seq(0), seq(1), seq(2)
			])
		).start(()=>{
			// console.log("start animation for dots")
		})
	}

	const animatedDot = (value, index) => {
    	let offSet = index*2;
    	return(
			<Animated.View
				key = {index*2} 
				style={[
					styles.circle,
					{left: index*2},
					{transform : [{scale: dotScales[index]}]}
				]}
			/>	
    	)
    }

	return (
		<View style={styles.lineOfCircles}>
			{
				dotScales.map((value, index)=>{
					return animatedDot(value, index)
				})
			}
		</View>
	);
}

const WelcomPage = ({dimensions, pageChange}) => {
	const [isProgressFull, progressCompleted] = useState(false);
	
	useEffect(()=>{
		isProgressFull && progressCompleted(false);
	},[dimensions.isLandscape])

	useEffect(() => {
		isProgressFull && setTimeout(()=>{
			// console.log("move to next screen");
			pageChange("MainAppPage");
		},1000);//delay for 1 sec
	},[isProgressFull])

	return(
		<>
			<View style={styles.textContainer}>
				<Text style={styles.title}>Welcome</Text>
				<Text style={styles.title}>to</Text>
				<Text style={styles.title}>Wisdom Box!</Text>
			</View>
			<View style={styles.textWithDots}>
				<Text style={styles.description}>{isProgressFull ? "" : "Wisdom Box is loading"}</Text>
				{!isProgressFull && <PulsingDots 
					isLandscape = {dimensions.isLandscape}
				/>}
			</View>
			<AnimatedProgressBar
					setProgress={progressCompleted}
					available_width={dimensions.isLandscape ? dimensions.width - 80 : dimensions.width - 40}
			/>
			<View style={styles.doneContainer}>
				<Text style={[styles.title, {padding: 5, opacity: isProgressFull ? 1 : 0}]}>Enjoy</Text>
				<Text style={styles.description}>Quotes By Famous People On Life & Success (2021)</Text>
			</View>
		</>
	)
} 

//add Footer;

export default WelcomPage;

const styles = StyleSheet.create({
	textContainer: {
		flex: 1,
		justifyContent: 'space-around',
		alignItems: 'center',
		paddingHorizontal: 10
	},
	title: {
		padding: 10,
		fontSize: 45,
		color: 'rgba(0, 122, 255, 1)',
		fontWeight: "bold",
		textShadowColor: 'rgba(99, 99, 99, 0.75)',
		textShadowOffset: {width: -3, height: 2},
		textShadowRadius: 10,
		textAlign: 'justify'
	},
	description: {
		fontSize: 26,
		textAlign: 'center',
		color: 'rgba(0, 122, 255, 1)',
	},
	doneContainer: {
		justifyContent: 'space-around',
		alignItems: 'center',
		padding: 5
	},
	progress_container: {
		borderWidth: 6,
		borderColor: '#1299C5',
		backgroundColor: '#ccc',
		borderRadius: 5,
		height: 42
	},
	textWithDots:{
		flexDirection: 'row',
		alignItems: 'flex-end',
		justifyContent: "center",
		margin: 10,
		fontWeight: "bold",
		height: 26
	},
	lineOfCircles:{
		flexDirection: 'row',
		padding: 3
	},
	circle:{
		width: 12,
		height: 12,
		borderRadius: 50,
		backgroundColor: "#1299C5"
	}
})

// https://www.rootstrap.com/blog/adding-animations-to-your-react-native-app-made-easy/
// https://blog.codecentric.de/en/2019/07/react-native-animated-with-hooks/