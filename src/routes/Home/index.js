import { injectReducer } from '../../store/reducers'

export default (store) => ({
  getComponent (nextState, next) {
    require.ensure([
      './containers/GridContainer',
      './modules/grid/reducer',
      './modules/formula/reducer'
    ], (require) => {
      /*  These modules are lazily evaluated using require hook, and
      will not loaded until the router invokes this callback. */
      const Grid = require('./containers/GridContainer').default
      const gridReducer = require('./modules/grid/reducer').default
      const formulaReducer = require('./modules/formula/reducer').default

      injectReducer(store, {
        key: 'grid',
        reducer: gridReducer
      })

      injectReducer(store, {
        key: 'formula',
        reducer: formulaReducer
      })

      next(null, Grid)
    })
  }
})
