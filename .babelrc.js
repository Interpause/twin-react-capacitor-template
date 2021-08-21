const presets = [
	[
		'@babel/preset-env',
		{
			useBuiltIns: 'usage',
			corejs: '3.16.2',
		},
	],
]

const plugins = ['@babel/plugin-transform-react-jsx']

if (process.env.NODE_ENV === 'production') {
	plugins.push('transform-remove-console')
}

module.exports = { presets, plugins }
