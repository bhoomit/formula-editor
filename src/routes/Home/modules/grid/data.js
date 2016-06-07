import _ from 'lodash'
import React from 'react'
import FormulaEditor from '../../containers/FormulaEditorContainer'

const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toLocaleDateString();
}

const randomWords = ["Lorel", "Ipsum", "Neque", "porro", "quisquam", "est", "qui", "dolorem", "ipsum", "quia", "dolor", "sit", "amet", ",", ";", "consectetur"]

const randomSentence = () => (_.capitalize(_.sampleSize(randomWords, _.random(1,10)).join(' ')))

let instance = null

class GridFactoryClass {

  constructor () {
    if (!instance) {
      instance = this
    }
    this.columns = [{
      key: 'id',
      name: 'ID',
      width: 80,
      type: 'NUMBER'
    },
    {
      key: 'revenue',
      name: 'Revenue',
      editable : false,
      type: 'NUMBER',
    },
    {
      key: 'quantity',
      name: 'Quantity',
      editable : false ,
      type: 'NUMBER',
    },
    {
      key: 'comment',
      name: 'Comment',
      editable: false,
      type: 'STRING'
    },
    {
      key: 'created_at',
      name: 'Created At',
      editable : false,
      type: 'DATE',
    }]
    this.columns.push({
      key: 'formulas',
      name: 'Formulas',
      editable : true, 
      editor : <FormulaEditor columnDef={this.columns}/> 
    })
    return instance
  }

  getColumns () {
    return this.columns
  }

  createRows (numberOfRows) {
    var _rows = []
    for (var i = 1; i < numberOfRows; i++) {
      _rows.push({
        id: i,
        created_at: randomDate(new Date(2015, 3, 1), new Date()),
        revenue: Math.floor((Math.random() * 1000000) + 1),
        quantity: Math.floor((Math.random() * 100) + 1),
        comment: randomSentence(),
        formulas: ''
      })
    }
    return _rows
  }
}

export const GridFactory = new GridFactoryClass()
