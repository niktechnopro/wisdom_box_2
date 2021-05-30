import AsyncStorage from '@react-native-async-storage/async-storage';

export const storeData = async (key, value) => {
    try {
        const jsonValue = JSON.stringify(value)
        return await AsyncStorage.setItem(key, jsonValue);
    } catch (e) {
        // saving error
        console.log("problem saving data");
    }
}

export const getData = async (key) => {
    try {
        return await AsyncStorage.getItem(key);
    } catch(e) {
        // error reading value
        console.log("problem getting data");
    }
}

