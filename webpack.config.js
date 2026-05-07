import path from 'path';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// eslint-disable-next-line no-undef
const isProduction = process.env.NODE_ENV === 'production';

export default {
    mode: isProduction ? 'production' : 'development',
    entry: './src/app.js',
    devtool: isProduction ? 'source-map' : 'eval-source-map',
    output: {
        filename: '[name].bundle.js',
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
                use: [isProduction ? MiniCssExtractPlugin.loader : 'style-loader', 'css-loader']
            },
            // Rule for CSS Modules
            {
                test: /\.module\.css$/, // Target files ending with .module.css
                use: [
                    isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
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
            },
            {
                // Rule for fonts
                test: /\.(woff2)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'assets/fonts/[name].[hash][ext]'
                }
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
            isProduction
        }),
        new MiniCssExtractPlugin({
            filename: '[name].css'
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: 'src/favicon.ico', to: 'favicon.ico' },
                { from: 'src/manifest.json', to: 'manifest.json' },
                { from: 'src/pwa-icon.png', to: 'pwa-icon.png' }
            ]
        })
    ],
    optimization: {
        splitChunks: {
            chunks: 'all'
        }
    },
    devServer: {
        port: 3000,
        host: '0.0.0.0',
        allowedHosts: 'all',
        open: false,
        compress: true,
        static: {
            directory: path.join(__dirname, './dist/'),
            publicPath: '/'
        }
    }
};
