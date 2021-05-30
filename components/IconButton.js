import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';

export const IconButton = ({type, color, handlePress, location}) => {
    return(
        <TouchableOpacity
            style={styles.button}
            onPress={handlePress}
        >
            <Icon name={type} size={30} color={color} />
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
        color: '#fff',
        fontWeight: "bold",
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: {width: -1, height: 1},
        textShadowRadius: 10,
        borderColor: '#2980b6',
    }
  });