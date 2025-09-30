import importPlugin from 'eslint-plugin-import'

export default [
  {
    plugins: {
      import: importPlugin
    },
    rules: {
      'import/no-unresolved': 'error',
      'import/named': 'error',
      'import/default': 'error',
      'import/namespace': 'error'
    }
  }
]