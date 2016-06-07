/* @flow */
import { connect } from 'react-redux'
import { actions } from '../modules/grid/reducer'

import Grid from '../components/Grid'

const mapActionCreators: {initGrid: Function, changeCell: Function} = {
  initGrid: actions.initGrid,
  changeCell: actions.changeCell
}

const mapStateToProps = (state) => ({
  columns: state.grid.columns,
  rows: state.grid.rows
})

export default connect(mapStateToProps, mapActionCreators)(Grid)