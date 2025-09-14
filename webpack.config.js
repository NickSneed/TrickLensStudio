import path from 'path';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    entry: './src/app.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.(?:js|mjs|cjs)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-env',
                            [
                                '@babel/preset-react',
                                {
                                    runtime: 'automatic'
                                }
                            ]
                        ]
                    }
                }
            },
            // Rule for global stylesheets
            {
                test: /\.css$/,
                exclude: /\.module\.css$/, // Exclude CSS Modules
                use: [process.env.NODE_ENV === 'production' ? MiniCssExtractPlugin.loader : 'style-loader', 'css-loader']
            },
            // Rule for CSS Modules
            {
                test: /\.module\.css$/, // Target files ending with .module.css
                use: [
                    process.env.NODE_ENV === 'production' ? MiniCssExtractPlugin.loader : 'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            modules: {
                                localIdentName: '[name]__[local]--[hash:base64:5]' // Customize generated class names
                            },
                            importLoaders: 1
                        }
                    }
                ]
            },
            {
                // Rule for images
                test: /\.(png|jpe?g|gif|svg)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'assets/images/[name].[hash][ext]'
                }
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html'
        }),
        new MiniCssExtractPlugin({
            filename: '[name].css'
        })
    ],
    devServer: {
        port: 3000,
        open: false,
        compress: true,
        static: {
            directory: path.join(__dirname, './dist/'),
            publicPath: '/'
        }
    }
};
