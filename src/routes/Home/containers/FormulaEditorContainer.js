/* @flow */
import { connect } from 'react-redux'
import { actions } from '../modules/formula/reducer'

import FormulaEditor from '../components/FormulaEditor'

const mapActionCreators: {initFormula: Function, textChanged: Function, resultSelected: Function} = {
  initFormulaSuggester: actions.initFormula,
  textChanged: actions.textChanged,
  resultSelected: actions.resultSelected
}

const mapStateToProps = (state) => ({
  placeHolderText: state.formula.placeHolderText,
  currentFormula: state.formula.currentFormula,
  searchResults: state.formula.searchResults,
  currentValue: state.formula.currentValue,
  valueArr: state.formula.valueArr
})

export default connect(mapStateToProps, mapActionCreators, null, {withRef: true})(FormulaEditor)