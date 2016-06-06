/* @flow */
import React from 'react'
import classes from './Grid.scss'
import ReactDataGrid from 'react-data-grid'

class Grid extends React.Component {

  constructor(props) {
    super(props)
    this.handleRowUpdated = this.handleRowUpdated.bind(this)
    this.rowGetter = this.rowGetter.bind(this)
  }

  componentDidMount() {
    this.props.initGrid(10)
  }
  
  handleRowUpdated (e) {
    this.props.changeCell(e)
  }

  rowGetter (rowIdx) {    
    return this.props.rows[rowIdx]
  }

  render () {
    return (
      <ReactDataGrid
        enableCellSelect={true}
        columns={this.props.columns}
        rowGetter={this.rowGetter}
        rowsCount={this.props.rows.length}
        minHeight={500}
        onRowUpdated={this.handleRowUpdated} />
      )
  }
}

Grid.PropTypes = {
  columns: React.PropTypes.array,
  rows: React.PropTypes.array
}

export default Grid