/* @flow */
import { columns, createRows } from './data'
// ------------------------------------
// Constants
// ------------------------------------
export const INIT_GRID = 'INIT_GRID'
export const CELL_CHANGED = 'CELL_CHANGED'
export const CELL_EDIT = 'CELL_EDIT'

// ------------------------------------
// Actions
// ------------------------------------

export function initGrid (rows: number): Action {
  return {
    type: INIT_GRID,
    payload: {
      rows
    }
  }
}

export function changeCell (data: object): Action {
  return {
    type: CELL_CHANGED,
    payload: {
      ...data
    }
  }
}

export function editCell (value: string): Action {
  return {
    type: CELL_EDIT,
    payload: {
      value
    }
  }
}

export const actions = {
  initGrid,
  changeCell,
  editCell
}


function AC_UpdateCellData(data: object, state: GridStateObject): GridStateObject {
  let newState = {...state}
  state.rows[data.rowIdx][data.cellKey] = data.updated.value;
  return newState;
}

// ------------------------------------
// Action Handlers
// ------------------------------------

const GRID_ACTION_HANDLERS = {
  [INIT_GRID]: (state: GridStateObject, action: {payload: object}): GridStateObject => {
    return ({ ...state, columns, rows: createRows(action.payload.rows) })
  },

  [CELL_CHANGED]: (state: GridStateObject, action: {payload: object}): GridStateObject => {
    return ({ ...state, ...AC_UpdateCellData(action.payload, state) })
  },
}

// ------------------------------------
// Reducers
// ------------------------------------

const initialState: GridStateObject = { rows: [], columns: [] }
export default function gridReducer (state: GridStateObject = initialState, action: Action): GridStateObject {
  const handler = GRID_ACTION_HANDLERS[action.type]

  return handler ? handler(state, action) : state
}

