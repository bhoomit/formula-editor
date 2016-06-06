import Bloodhound from 'bloodhound-js'
import React from 'react'
import { trimStart } from 'components/Utils'
import _ from 'lodash'

let SUGGESTORS = {}

const Formulas = {
  count: 'count({predicate})', 
  max: 'max({predicate}, {field})',
  min: 'min({predicate}, {field})', 
  sum: 'sum({predicate}, {field})',
  avg: 'avg({predicate}, {field})', 
  daysAgo: 'daysAgo({number})'
}

const TypesToFormulaMap = {
  'NUMBER': ['count', 'max', 'min', 'sum', 'avg'],
  'DATE': ['daysAgo']
} 

const Comparators = ['>', '<', '>=', '<=', '==', 'NOT']

const Delimiters = [' ', '(', ')', ','] 

const BloodHoundDefaults = {
  queryTokenizer: Bloodhound.tokenizers.whitespace,
  datumTokenizer: Bloodhound.tokenizers.whitespace
}

// Utils

const _getFormulaDisplayData = (state) => {
  
  return {
    highlighted: _.slice(state.valueArr, 0, state.currentPartIndex + 2).join(' '),
    nonHighlighted: _.slice(state.formulaParts, state.currentPartIndex).join(' '),
    // "highlightFields" can be used when we want to highlight colums while formula is being built
    highlightFields: _.reduce(state.valueArr, function(result, value) {
      _.startsWith(value, '@') && result.push(_.trimStart(value, '@'))
      return result
    }, [])
  }
}

const _getBloodhound = (key, prevKey) => {
  //Here I should configure when formula inside formula and context is implemented
  // let comparator = (key== 'field' )?'comparator'
  //   : key == 'predicate'? 'field'
  //   : key
  return SUGGESTORS[key]
}

const _invokeBloodhound = (query, state, dispatch) => {
  if(state.currentPartIndex >= state.formulaParts.length) return
  let parts = state.formulaParts[state.currentPartIndex].match(/\{([^}]+)\}/)
  let key = parts && parts[1] || undefined
  if (key) {
    return _getBloodhound(
      key,
      state.valueArr[_.last(state.prevPartIndex)]
    ).search(query, (results) => dispatch(result_received(results)))
  } 
  return dispatch(resultSelected(state.formulaParts[state.currentPartIndex]))
}

// Utils over

const AC_InitSuggestors = (fields) => {
  let fields_arr = _.map(fields, (value)=>('@' + value.key))
  SUGGESTORS = { ...SUGGESTORS, ...{
      field: new Bloodhound({local: fields_arr, ...BloodHoundDefaults}),
      formula: new Bloodhound({local: _.keys(Formulas) , ...BloodHoundDefaults}),
      comparator: new Bloodhound({local: Comparators, ...BloodHoundDefaults}),
      //for formula inside formula purpose
      formulaAndField: new Bloodhound({local: [..._.keys(Formulas), ...fields_arr] , ...BloodHoundDefaults})
    }
  }
}

const AC_textChanged = (currentValue, key, state, dispatch) => {
  let partIndex = state.currentPartIndex
  let partialState = { ...state, currentValue }
  let query = _.trim(trimStart(currentValue, _.slice(state.valueArr, 0, partIndex).join('')), ',')
  switch(key){
    case "Backspace":
      let valueArray = _.slice(state.valueArr, 0, partIndex)
      if (currentValue.length <= valueArray.join('').length) {
        partIndex = _.last(state.prevPartIndex)
        valueArray = _.slice(state.valueArr, 0, partIndex)
        partialState = {
          ...partialState,
          currentPartIndex: partIndex,
          prevPartIndex: _.slice(state.prevPartIndex, 0, state.prevPartIndex.length-1),
          valueArr: valueArray
        }
        query = _.trim(trimStart(partialState.currentValue, _.slice(state.valueArr, 0, partIndex).join(''))) || null
      }
      break
    default:
      break
  }
  dispatch({type: STATE_UPDATED, payload: { newState: partialState }})
  return query != null &&  dispatch(search_called(query)) || null
}

const AC_ResultSelected = (key, state, dispatch) => {  
  let partialState = {...state}
  let valueArr = [
    ..._.slice(state.valueArr, 0, state.currentPartIndex),
    key
  ]
  if (state.currentPartIndex == 1){
    let formula = key
    let format = Formulas[formula].match(/{(.*?)}/g)    
    partialState.formula = formula
    partialState.formulaParts = [
      ..._.slice(state.formulaParts, 0, state.currentPartIndex + 1), 
      ...['(', '{field}', '{comparator}', '{field}'], 
      ...format.length==2?[',', '{field}']:[],
      ')'
    ]
    partialState.currentFormula = {
      title: formula,
      formula: partialState.formulaParts.join('')
    }
  }   
  partialState = {
    ...partialState,
    valueArr,
    currentPartIndex: state.currentPartIndex + 1,
    prevPartIndex: [...state.prevPartIndex, state.currentPartIndex],
    searchResults: [],
    currentValue: valueArr.join(''),
    placeHolderText: valueArr.join(''),
  }
  partialState.currentFormula = { 
    ...partialState.currentFormula,
    display_data: _getFormulaDisplayData(partialState)
  }
  dispatch({type: STATE_UPDATED, payload: { newState: partialState }})
  return dispatch(search_called(''))
}

const AC_ResultReceived = (results, state) => {
  let searchResults = _.reduce(results, function(result, value) {
    result.push({title: value, format: Formulas[value]})
    return result
  }, [])
  let placeHolderText = results[0]?(_.slice(state.valueArr, 0, state.currentPartIndex).join('') + results[0]):undefined
  return {...state, searchResults, placeHolderText}
}


// Proper module starts here
// ------------------------------------
// Constants
// ------------------------------------
export const INIT_FORMULA = 'INIT_FORMULA'
export const TEXT_CHANGED = 'TEXT_CHANGED'
export const RESULT_SELECTED = 'RESULT_SELECTED'
const RESULT_RECEIVED = 'RESULT_RECEIVED'
const STATE_UPDATED = 'STATE_UPDATED'

// ------------------------------------
// Actions
// ------------------------------------

//Exposed actions

export function initFormula (fields: array): Action {
  return {
    type: INIT_FORMULA,
    payload: {
      fields
    }
  }
}

export function textChanged (value: text, keyPressed: string): Action {
  return function(dispatch, getState) {
    return AC_textChanged(value, keyPressed, getState().formula, dispatch)
  }
}

export function resultSelected (key: text): Action {
  return function(dispatch, getState) {
    return AC_ResultSelected(key, getState().formula, dispatch)
  }
}

// non exposed actions

function search_called (query: text) {
  return (dispatch, getState) => {
    return _invokeBloodhound(query, getState().formula, dispatch)
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
    debugger
    AC_InitSuggestors(action.payload.fields) 
    return ({ ...state})
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
  //for internal use
  formulaParts: ['=', '{formula}'],
  currentPartIndex: 1,
  prevPartIndex:[0],
  valueArr: ['=']
}

export default function formulaReducer (state: FormulaStateObject = initialState, action: Action): FormulaStateObject {
  const handler = FORMULA_ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}


