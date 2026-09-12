const colors = {
  gradient: {
    /**
     * Exercise-progress ramp, in the app icon's node colours: the cyan OR node through
     * the teal and green leaves to the lime one. Each step is a fill with a dark numeral
     * over it, which all of them clear comfortably (>= 7.3:1 against black).
     */
    brand: ['#00A9B6', '#02B490', '#28B327', '#5CC63F', '#77CF51'],
  },
} as const;

export default colors;
