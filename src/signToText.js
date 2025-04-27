const signToText = (gesture) => {
    const gestureMapping = {
        "hello": "Hello!",
        "thank_you": "Thank You",
        "yes": "Yes",
        "no": "No",
        "please": "Please",
    };

    return gestureMapping[gesture] || "Gesture not recognized";
};

export default signToText;

