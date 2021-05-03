const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    entry: {
        index: './src/index.js',
    },
    devtool: 'source-map',
    devServer: {
        contentBase: path.join(__dirname, 'build'),
        port: 3000,
        watchOptions: {
            poll: 10000
        }
    },
    module: {
        rules: [
            {
                exclude: /node_modules/,
                test: /\.js$|jsx$/,
                use: 'babel-loader'
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.svg$/,
                use: '@svgr/webpack'
            }
        ]
    },
    optimization: {
        runtimeChunk: 'single'
    },
    plugins: [
        new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
        new HtmlWebpackPlugin({ title: 'MARTA Army Transit Map' }),
    ],
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'build'),
    }
};
