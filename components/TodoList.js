import React, { useState, useRef } from "react";
import { View, Text, TextInput, StyleSheet, useWindowDimensions, TouchableOpacity, Animated } from "react-native"; 

const initToDoObj = {
    todo: "",
    isCompleted: false
}

const TodoList = () => {
    const dimensions = useWindowDimensions();

    let helperArray = [];
    for(let property in dimensions){
        helperArray.push(property);
    }

    const animInOut = useRef(new Animated.Value(-dimensions.width)).current;

    const [inputValue, setInputValue] = useState({...initToDoObj});
    const [todos, adjustToDo] = useState([]);


    const onButtonPress = () => {
        animInOut.setValue(-dimensions.width);
        const newTodos = [...todos];
        newTodos.push(inputValue);
        adjustToDo([...newTodos]);
        setInputValue({...initToDoObj});
        Animated.timing(
            animInOut,
            {
                toValue: 0,
                duration: 300,
                useNativeDriver: true
            }
        ).start();
    }

    const completeToDo = (idx) => {
        const newTodos = [...todos];
        newTodos[idx] = {...newTodos[idx], isCompleted: !newTodos[idx].isCompleted};
        adjustToDo(newTodos);
    }

    const removeToDo = (idx) => {
        const newTodos = [...todos];
        newTodos.splice(idx, 1);
        Animated.timing(
            animInOut,
            {
                toValue: dimensions.width,
                duration: 300,
                useNativeDriver: true
            }
        ).start(()=>{
            adjustToDo(newTodos);
            animInOut.setValue(0);
        });
    }

    return(
        <View style={[styles.wrapper, {...dimensions}]}>
            {
                helperArray.map((value, idx) => {
                    return <Text key={value+idx}>{`${value} : ${dimensions[value]}`}</Text>
                })
            }
            <View style={{flexDirection: "row", alignItems: "center"}}>
                <TextInput
                    style={{backgroundColor: "gray", width: "50%", color: "#fff", fontSize: 20}}
                    value={inputValue.todo}
                    autoFocus={true}
                    placeholder="type your todo here"
                    placeholderTextColor='#fff'
                    multiline={false}
                    numberOfLines={1}
                    // onChange={({nativeEvent})=>setInputValuedfgfdg(nativeEvent.text)}
                    onChangeText={(text) => setInputValue({...initToDoObj, todo: text})}

                />
                <TouchableOpacity
                    style={styles.pressButton}
                    onPress={onButtonPress}
                >
                    <Text style={{color: "#fff", fontWeight: "bold"}}>Add todo</Text>
                </TouchableOpacity>
            </View>
            <View>
                {
                    todos.map((value, idx) => {
                        return(
                            <Animated.View 
                                key={value.todo + idx}
                                style={{
                                    flexDirection: "row", 
                                    alignItems: "center",
                                    transform : [{translateX: animInOut}] 
                                }}
                            >
                                <Text style={{fontSize: 18}}>{value.todo}</Text>
                                <TouchableOpacity
                                    onPress={() => completeToDo(idx)}
                                    style={[styles.pressButton, {backgroundColor: "#fff"}]}
                                >
                                    <Text 
                                        style={{color: value.isCompleted ? "green" : "red"}}
                                    >
                                        {value.isCompleted ? "Completed" : "Completed? "}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => removeToDo(idx)}
                                    style={[styles.pressButton, {backgroundColor: "#fff"}]}
                                >
                                    <Text 
                                        style={{color: "red"}}
                                    >
                                       remove
                                    </Text>
                                </TouchableOpacity>
                            </Animated.View>
                        )
                    })
                }
            </View>
        </View>
    )
}

export default TodoList;

const styles = StyleSheet.create({
    wrapper: {
        // flex: 1,
        borderWidth: 2,
        borderColor:"red"
    },
    pressButton:{
        borderWidth: 2, 
        borderColor: "green", 
        height: 45, 
        justifyContent: "center", 
        backgroundColor: "grey", 
        borderRadius: 5
    }
})