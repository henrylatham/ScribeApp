import color from 'color';

/** Purple */
const primaryColor = '#C769FF';
/** Light grey */
const revPrimaryColor = '#FAFAFA';
/** Black and grey */
const secondaryColor = '#353535';
const revSecondaryColor = '#C2BCC5';
const WhiteColor = '#ffffff';

export default {
    headerBackgroundColor: WhiteColor,
    headerForegroundColor: WhiteColor,
    actionButtonColor: primaryColor,
    fieldIdColor: color(primaryColor).lighten(0.5).string()
};
