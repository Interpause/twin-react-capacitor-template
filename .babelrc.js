const presets = ['@babel/preset-env']

const plugins = ['@babel/plugin-transform-react-jsx']

if (process.env.NODE_ENV === 'production') {
	plugins.push('transform-remove-console')
}

module.exports = { presets, plugins }
