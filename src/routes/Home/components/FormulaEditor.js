import React from 'react'
import ReactDOM from 'react-dom'
import classnames from 'classnames'
import { ListGroup, ListGroupItem } from 'react-bootstrap'
import classes from './FormulaEditor.scss'


class FormulaEditor extends React.Component {
  
  constructor (props) {
    super(props)
    this.handleResultSelection = this.handleResultSelection.bind(this)
    this.handleTextChange = this.handleTextChange.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.getInputNode = this.getInputNode.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.state = {
      textValue: ''
    }
  }

  getInputNode() {
    return ReactDOM.findDOMNode(this).getElementsByTagName('input')[0]
  }

  componentDidMount() {
    this.props.initFormula(this.props.columnDef)    
  }

  getValue() {
    return this.props.valueArr.join('')
  } 

  handleKeyDown (e) {
    if(e.key == 'Tab') {
      e.stopPropagation()
      e.preventDefault()
      let domNode = ReactDOM.findDOMNode(this.refs.list_item_0)
      domNode && this.props.resultSelected(domNode.firstChild.textContent)
      this.refs.masterInput.focus()
    }
  }

  handleResultSelection (e) {
    this.props.resultSelected(e.currentTarget.firstChild.textContent)
    this.refs.masterInput.focus()
  }

  handleTextChange (e) {
    this.props.textChanged(e.currentTarget.value, e.key)
  }

  handleChange (e) {
    this.setState({textValue: e.currentTarget.value})
  }

  componentDidUpdate(prevProps, prevState) {
    this.refs.masterInput.value = this.props.currentValue
  }

  render () {
    return (
      <div className={classes.FormulaEditor}>
        <input 
          disabled
          type="text"
          style={{position: 'absolute', zIndex:0,  left: 0, top: 0, WebkitTextFillColor: 'silver', backgroundColor: 'transparent'}}
          value={this.props.placeHolderText}/>
        <input style={{opacity: 0}}/> 
        <input 
          ref='masterInput'
          type="text" 
          className='editor-main'
          autoFocus
          onKeyUp={this.handleTextChange} 
          onKeyDown={this.handleKeyDown}  
          onChange={this.handleChange}        
          value={this.state.textValue}
          style={{position: 'absolute', zIndex: 10, left: 0, top: 0}}/>
        { (this.props.searchResults.length > 0 || this.props.currentFormula) && 
          <ListGroup >
            { this.props.currentFormula && 
              <ListGroupItem key="formula" disabled>
                <b style={{color: '#306E12'}}>{this.props.currentFormula.display_data.highlighted}</b>
                <span> {this.props.currentFormula.display_data.nonHighlighted}</span>
              </ListGroupItem>
            }

            { this.props.searchResults.map((formula, index) => 
              <ListGroupItem ref={"list_item_" + index} key={index} header={formula.title} onClick={this.handleResultSelection}>{formula.format}</ListGroupItem>
            )}
          </ListGroup>
        }
      </div>
    )
  }
}

FormulaEditor.propTypes = {
  onCommit: React.PropTypes.func,
  value: React.PropTypes.any,
  onFieldHighlight: React.PropTypes.func,
  columnDef: React.PropTypes.array,
  placeHolderText: React.PropTypes.string,
  currentFormula: React.PropTypes.object,
  searchResults: React.PropTypes.array,
  currentValue: React.PropTypes.string,
  valueArr: React.PropTypes.array
}

export default FormulaEditor