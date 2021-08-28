const webpack = require('webpack')
const path = require('path')

const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const ReactRefreshTypeScript = require('react-refresh-typescript')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { WebpackPluginServe } = require('webpack-plugin-serve')
const BundleAnalyzerPlugin =
	require('webpack-bundle-analyzer').BundleAnalyzerPlugin

const isDev = process.env.NODE_ENV == 'development'
const outPath = path.resolve(__dirname, 'dist')

const config = {
	mode: isDev ? 'development' : 'production',
	entry: [isDev && 'webpack-plugin-serve/client', './index.tsx'].filter(
		Boolean,
	),
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
							getCustomTransformers: () => ({
								before: isDev ? [ReactRefreshTypeScript()] : [],
							}),
							transpileOnly: !isDev,
							onlyCompileBundledFiles: true,
							experimentalFileCaching: true,
						},
					},
				],
			},
			// in Typescript, use require('./asset/test.mp3') to get URL or Base64 encoded string
			// for example, const clickSound = new Audio(require('./asset/click.mp3'))
			// or, <img src={require('./asset/cat.png')}/>
			{
				test: /\.(png|jpg|gif|mp3)$/,
				type: 'asset',
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
		isDev && new ReactRefreshWebpackPlugin(),
		!isDev &&
			new BundleAnalyzerPlugin({
				analyzerMode: 'static',
				reportFilename: '../report.html',
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
