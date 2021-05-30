//I am going to place a helper function that will return
const animationsIn = ["bounceIn", "bounceInDown", "bounceInUp", "bounceInLeft", "bounceInRight", "fadeIn", "fadeInDown", "fadeInDownBig", "fadeInUp", "fadeInUpBig", "fadeInLeft", "fadeInLeftBig", "fadeInRight", "fadeInRightBig", "zoomIn", "zoomInDown", "zoomInUp", "zoomInLeft", "zoomInRight"];
const animationsOut = ["bounceOut", "bounceOutDown", "bounceOutUp", "bounceOutLeft", "bounceOutRight", "fadeOut", "fadeOutDown", "fadeOutDownBig", "fadeOutUp", "fadeOutUpBig", "fadeOutLeft", "fadeOutLeftBig", "fadeOutRight", "fadeOutRightBig", "zoomOut", "zoomOutDown", "zoomOutUp", "zoomOutLeft", "zoomOutRight"];
const direction = ["normal", "reverse", "alternate", "alternate-reverse"];

export const setAnimations = () => {
    let indexIn = Math.floor(Math.random()*animationsIn.length);
    let indexOut = Math.floor(Math.random()*animationsOut.length);
    let autIndexIn = Math.floor(Math.random()*animationsIn.length);
    let autIndexOut = Math.floor(Math.random()*animationsOut.length);
    let directionIndex = Math.floor(Math.random()*direction.length);
    return {
        animationsIn : animationsIn[indexIn],
        animationsOut : animationsOut[indexOut],
        autAnimationIn : animationsIn[autIndexIn],
        autAnimationOut : animationsOut[autIndexOut],
        direction : direction[directionIndex]
    }
}
