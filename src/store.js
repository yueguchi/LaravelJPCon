export default {
  modules: {
    navigator: {
      strict: true,
      namespaced: true,
      state: {
        stack: [],
        options: { animation: 'slide' }
      },
      mutations: {
        push(state, page) {
          state.stack.push(page)
        },
        pop(state) {
          if (state.stack.length > 1) {
            state.stack.pop()
          }
        },
        replace(state, page) {
          state.stack.pop()
          state.stack.push(page)
        },
        reset(state, page) {
          state.stack = [page || state.stack[0]]
        },
        options(state, newOptions = {}) {
          state.options = newOptions
        }
      }
    },
    tabbar: {
      strict: true,
      namespaced: true,
      state: {
        index: 0
      },
      mutations: {
        set(state, index) {
          state.index = index
        }
      }
    },
    master: {
      strict: true,
      namespaced: true,
      state: {
        master: []
      },
      mutations: {
        setMaster(state, data) {
          state.master = data
        }
      },
      getters: {
        sponsors: state => {
          return state.master.sponsors
        }
      }
    }
  }
}
