const colors = {
  gradient: {
    /**
     * Exercise-progress ramp, in the app icon's node colours: the cyan OR node through
     * the teal and green leaves to the lime one. Each step is a fill with a dark numeral
     * over it, which all of them clear comfortably (>= 7.3:1 against black).
     */
    brand: ['#00A9B6', '#02B490', '#28B327', '#5CC63F', '#77CF51'],
  },
  /**
   * Leaf/variable node fill+text in the expression tree, mirroring the true/false button colours
   * (`.btn-primary` / `.btn-danger`) so the tree shows each variable's current value at a glance.
   * `fill` must stay in sync with $primary ($el-cyan) / Bootstrap's default $danger; `text` must
   * stay in sync with whatever Bootstrap's color-contrast() picks for that button.
   */
  truthValue: {
    true: { fill: '#00A9B6', text: '#000000' },
    false: { fill: '#dc3545', text: '#ffffff' },
  },
} as const;

export default colors;
