const webpack = require('webpack')
const path = require('path')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const { WebpackPluginServe } = require('webpack-plugin-serve')

const isDev = process.env.NODE_ENV == 'development'
const outPath = path.resolve(__dirname, 'dist')

const config = {
	mode: isDev ? 'development' : 'production',
	entry: [isDev && 'webpack-plugin-serve/client', './index.ts'].filter(Boolean),
	output: {
		path: outPath,
		filename: '[name].bundle.js',
		clean: true,
	},
	target: 'browserslist',
	module: {
		rules: [
			{
				test: /\.ts(x)?$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'babel-loader',
						options: {
							cacheDirectory: true,
						},
					},
					{
						loader: 'ts-loader',
						options: {
							transpileOnly: !isDev,
							onlyCompileBundledFiles: true,
							experimentalFileCaching: true,
						},
					},
				],
			},
		],
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.jsx', '.js'],
	},
	plugins: [
		new HtmlWebpackPlugin({
			title: 'twin-react-capacitor-template',
		}),
		isDev &&
			new WebpackPluginServe({
				host: 'localhost',
				port: 8080,
				progress: 'minimal',
				static: outPath,
			}),
	].filter(Boolean),
	watch: isDev,
	devtool: isDev ? 'eval-source-map' : false,
}

module.exports = config