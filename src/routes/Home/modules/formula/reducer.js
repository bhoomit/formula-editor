import _ from 'lodash'
import { trimStart } from 'components/Utils'
import { BloodhoundFactory, FormulaUtils, Formulas } from './data'


const invokeTypeahead  = (query, state, dispatch) => {
  if(state.currentPartIndex >= state.formulaParts.length) return
  let parts = state.formulaParts[state.currentPartIndex].match(/\{([^}]+)\}/) || []
  let key = parts[1] || _.noop()
  if (key) {
    return BloodhoundFactory.get(key).search(query, (results) => dispatch(result_received(results)))
  } 
  return dispatch(resultSelected(state.formulaParts[state.currentPartIndex]))
}

const AC_textChanged = (currentValue, key, state, dispatch) => {
  let partIndex = state.currentPartIndex
  let partialState = { ...state, currentValue }
  let query = _.trim(trimStart(currentValue, _.slice(state.valueArr, 0, partIndex).join('')), ',')
  key = FormulaUtils.endsWithDelimiters(query)?'Delimiter':key
  // key = _.indexOf(state.searchResults, query) != -1?'Result':key 
  switch(key){
    case 'Delimiter': 
    case 'Result':
      return dispatch(resultSelected(query))      
    case 'Backspace':
      let valueArray = _.slice(state.valueArr, 0, partIndex)
      if (currentValue.length <= valueArray.join('').length) {
        partIndex = _.last(state.prevPartIndex)
        partialState = {
          ...partialState,
          currentPartIndex: partIndex,
          prevPartIndex: _.slice(state.prevPartIndex, 0, state.prevPartIndex.length-1),
          valueArr: _.slice(state.valueArr, 0, partIndex)
        }
        query = _.trim(trimStart(partialState.currentValue, _.slice(state.valueArr, 0, partIndex).join(''))) || null
      }
    default:
      dispatch({type: STATE_UPDATED, payload: { newState: partialState }})
      return query != null &&  dispatch(search_called(query)) || null
  }
  
}

const AC_ResultSelected = (key, state, dispatch) => {  
  let partialState = {...state}
  let valueArr = [
    ..._.slice(state.valueArr, 0, state.currentPartIndex),
    key
  ]
  let currentValue = valueArr.join('')
  if (state.currentPartIndex == 1){
    //This means formula has been selcted
    partialState.formulaParts = FormulaUtils.getFormulaParts(key)
    partialState.currentFormula = {
      title: key,
      formula: partialState.formulaParts.join('')
    }
    //sets context
    FormulaUtils.initTypeaheadForFormula(key, state.fields)
  }   
  partialState = {
    ...partialState,
    valueArr,
    currentValue,
    placeHolderText: currentValue,
    searchResults: [],
    currentPartIndex: state.currentPartIndex + 1,
    prevPartIndex: [...state.prevPartIndex, state.currentPartIndex],
  }
  partialState.currentFormula = { 
    ...partialState.currentFormula,
    display_data: FormulaUtils.getFormulaDisplayData(partialState)
  }
  dispatch({type: STATE_UPDATED, payload: { newState: partialState }})
  return dispatch(search_called(''))
}

const AC_ResultReceived = (results, state) => {
  let searchResults = _.reduce(results, function(result, value) {
    result.push({title: value, format: _.isUndefined(Formulas[value])?'':Formulas[value].format})
    return result
  }, [])
  let placeHolderText = results[0]?(_.slice(state.valueArr, 0, state.currentPartIndex).join('') + results[0]):_.noop()
  return {...state, searchResults, placeHolderText}
}


// Proper module starts here
// ------------------------------------
// Constants
// ------------------------------------
const INIT_FORMULA = 'INIT_FORMULA'
const TEXT_CHANGED = 'TEXT_CHANGED'
const RESULT_SELECTED = 'RESULT_SELECTED'
const RESULT_RECEIVED = 'RESULT_RECEIVED'
const STATE_UPDATED = 'STATE_UPDATED'


// ------------------------------------
// Actions
// ------------------------------------


function initFormula (fields: array): Action {
  return {
    type: INIT_FORMULA,
    payload: {
      fields
    }
  }
}

function textChanged (value: text, keyPressed: string): Action {
  return function(dispatch, getState) {
    return AC_textChanged(value, keyPressed, getState().formula, dispatch)
  }
}

function resultSelected (key: text): Action {
  return function(dispatch, getState) {
    return AC_ResultSelected(key, getState().formula, dispatch)
  }
}

// non exposed actions

function search_called (query: text) {
  return (dispatch, getState) => {
    return invokeTypeahead(query, getState().formula, dispatch)
  }
}

function result_received (results: array): Action {
  return {
    type: RESULT_RECEIVED,
    payload: {
      results
    }
  }
}


export const actions = {
  initFormula,
  textChanged,
  resultSelected
}

// ------------------------------------
// Action Handlers
// ------------------------------------

const FORMULA_ACTION_HANDLERS = {

  [INIT_FORMULA]: (state: FormulaStateObject, action: {payload: object}): FormulaStateObject => {
    return ({ ...state, fields: action.payload.fields})
  },

  [TEXT_CHANGED]: (state: FormulaStateObject, action: {payload: object}): FormulaStateObject => {
    return ({ ...state, ...AC_textChanged(action.payload.value, action.payload.keyPressed, state)})
  },

  [RESULT_SELECTED]: (state: FormulaStateObject, action: {payload: object}): FormulaStateObject => {
    return ({ ...state, ...AC_ResultSelected(action.payload.key, state)})
  },

  [STATE_UPDATED]: (state: FormulaStateObject, action: {payload: object}): FormulaStateObject => {
    return ({ ...state, ...action.payload.newState})
  },

  [RESULT_RECEIVED]: (state: FormulaStateObject, action: {payload: object}): FormulaStateObject => {
    return ({ ...state, ...AC_ResultReceived(action.payload.results, state)})
  }
}


const initialState: FormulaStateObject = { 
  placeHolderText: '=',
  currentFormula: null,
  searchResults: [],
  currentValue: null,
  valueArr: ['='],
  //for internal use
  formulaParts: ['=', '{formula}'],
  currentPartIndex: 1,
  prevPartIndex:[0],
}

export default function formulaReducer (state: FormulaStateObject = initialState, action: Action): FormulaStateObject {
  const handler = FORMULA_ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}


