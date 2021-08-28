const presets = []

const plugins = [
	'@emotion/babel-plugin',
	'babel-plugin-macros',
	[
		'@emotion/babel-plugin-jsx-pragmatic',
		{
			export: 'jsx',
			import: '__cssprop',
			module: '@emotion/react',
		},
	],
	[
		'@babel/plugin-transform-react-jsx',
		{
			pragma: '__cssprop',
			pragmaFrag: 'React.Fragment',
		},
	],
]

if (process.env.NODE_ENV === 'production') {
	plugins.push('transform-remove-console')
	presets.push([
		'@babel/preset-env',
		{
			useBuiltIns: 'usage',
			corejs: '3.16.2',
			modules: false,
		},
	])
}

module.exports = { presets, plugins }
