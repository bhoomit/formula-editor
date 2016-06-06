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

// ------------------------------------
// Action Handlers
// ------------------------------------

const GRID_ACTION_HANDLERS = {
  [INIT_GRID]: (state: GridStateObject, action: {payload: object}): GridStateObject => {
    return ({ ...state, columns, rows: createRows(action.payload.rows) })
  }
}

// ------------------------------------
// Reducers
// ------------------------------------

const initialState: GridStateObject = { rows: [], columns: [] }
export default function gridReducer (state: GridStateObject = initialState, action: Action): GridStateObject {
  const handler = GRID_ACTION_HANDLERS[action.type]

  return handler ? handler(state, action) : state
}

