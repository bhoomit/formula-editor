/* @flow */
import { GridFactory } from './data'
// ------------------------------------
// Constants
// ------------------------------------
const INIT_GRID = 'INIT_GRID'
const CELL_CHANGED = 'CELL_CHANGED'

// ------------------------------------
// Actions
// ------------------------------------

function initGrid (rows: number): Action {
  return {
    type: INIT_GRID,
    payload: {
      rows
    }
  }
}

function changeCell (data: object): Action {
  return {
    type: CELL_CHANGED,
    payload: {
      ...data
    }
  }
}

export const actions = {
  initGrid,
  changeCell
}

function AC_UpdateCellData(data: object, state: GridStateObject): GridStateObject {
  let newState = {...state}
  state.rows[data.rowIdx][data.cellKey] = data.updated.value
  return newState
}

const initialState: GridStateObject = { rows: [], columns: [] }

// ------------------------------------
// Action Handlers
// ------------------------------------

const GRID_ACTION_HANDLERS = {
  [INIT_GRID]: (state: GridStateObject, action: { payload: object }): GridStateObject => {
    return ({ ...state, columns: GridFactory.getColumns(), rows: GridFactory.createRows(action.payload.rows) })
  },

  [CELL_CHANGED]: (state: GridStateObject, action: { payload: object }): GridStateObject => {
    return ({ ...state, ...AC_UpdateCellData(action.payload, state) })
  }
}

// ------------------------------------
// Reducers
// ------------------------------------


export default function gridReducer (state: GridStateObject = initialState, action: Action): GridStateObject {
  const handler = GRID_ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}

