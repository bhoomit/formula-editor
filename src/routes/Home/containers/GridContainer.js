/* @flow */
import { connect } from 'react-redux'
import { initGrid, changeCell, editCell } from '../modules/grid'

import Grid from '../components/Grid'

const mapActionCreators: {initGrid: Function, changeCell: Function, editCell: Function} = {
  initGrid,
  changeCell,
  editCell
}

const mapStateToProps = (state) => ({
  columns: state.grid.columns,
  rows: state.grid.rows
})

export default connect(mapStateToProps, mapActionCreators)(Grid)