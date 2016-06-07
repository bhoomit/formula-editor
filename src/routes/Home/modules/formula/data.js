import _ from 'lodash'
import Bloodhound from 'bloodhound-js'

export const Formulas = {
  count: { format: 'count({predicate})', types: ['NUMBER', 'DATE', 'STRING'] }, 
  max: { format: 'max({predicate}, {field})', types: ['NUMBER', 'DATE'] },
  min: { format: 'min({predicate}, {field})', types: ['NUMBER', 'DATE'] },
  sum: { format: 'sum({predicate}, {field})', types: ['NUMBER'] },
  avg: { format: 'avg({predicate}, {field})', types: ['NUMBER'] },
  daysAgo: { format: 'daysAgo({field})', types: ['NUMBER', 'DATE'] },
  trim: { format: 'trim({field})', types: ['STRING'] }
}

const Comparators = ['>', '<', '>=', '<=', '==', 'NOT']

const Delimiters = [' ', '(', ')', ','] 

const BloodHoundDefaults = {
  queryTokenizer: Bloodhound.tokenizers.whitespace,
  datumTokenizer: Bloodhound.tokenizers.whitespace
}

let instance = null

class BloodhoundFactoryClass {  
  constructor () {
    if (!instance) {
      instance = this;
    }
    this.bloodhounds = {
      formula: new Bloodhound({local: _.keys(Formulas) , ...BloodHoundDefaults}),
      comparator: new Bloodhound({local: Comparators, ...BloodHoundDefaults})
    }
    return instance
  }

  add (key, data) {
    let bloodhound = this.get(key)
    if (bloodhound) {
      bloodhound.clear()
      bloodhound.add(data)
    } else {
      this.bloodhounds[key] = new Bloodhound({local: data, ...BloodHoundDefaults}) 
    } 
  }

  get (key) {
    debugger
    return this.bloodhounds[key]
  }
}

export const BloodhoundFactory = new BloodhoundFactoryClass()

export class FormulaUtils {
  
  static getFormulaParts (formula) {
    let raw_parts = Formulas[formula].format.match(/{(.*?)}/g)  
    let parts = ['=', '{formula}', '(']
    _.reduce(raw_parts, (result, key, index)=> {
      index > 0 && parts.push(',')
      switch(key){
        case '{predicate}':
          parts = [...parts, '{field}', '{comparator}', '{field}']
          break
        case '{field}':
          parts.push('{field}')
      }
      return parts
    }, parts)
    parts.push(')')
    return parts
  }

  static getFormulaDisplayData (state) {
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

  static initTypeaheadForFormula (formula_key, fields) {
    let fieldsInContext = []
    for (let type of Formulas[formula_key].types){
      _.reduce(fields, (result, value) => {
        value.type == type && result.push(value)
        return result
      }, fieldsInContext) 
    }
    BloodhoundFactory.add('field', _.map(fieldsInContext, (value)=>('@' + value.key)))
  }

  static endsWithDelimiters (query) {
    return _.indexOf(Delimiters, _.last(query)) != -1
  }
}
