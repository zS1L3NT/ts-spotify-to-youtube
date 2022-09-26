# Spotify To YouTube

![License](https://img.shields.io/github/license/zS1L3NT/ts-spotify-to-youtube?style=for-the-badge) ![Languages](https://img.shields.io/github/languages/count/zS1L3NT/ts-spotify-to-youtube?style=for-the-badge) ![Top Language](https://img.shields.io/github/languages/top/zS1L3NT/ts-spotify-to-youtube?style=for-the-badge) ![Commit Activity](https://img.shields.io/github/commit-activity/y/zS1L3NT/ts-spotify-to-youtube?style=for-the-badge) ![Last commit](https://img.shields.io/github/last-commit/zS1L3NT/ts-spotify-to-youtube?style=for-the-badge)

A CLI tool to convert songs in multiple Spotify playlists to YouTube videos. This will be useful if you are moving a playlist from Spotify to YouTube Music and need to mass convert songs to YouTube videos. This CLI tool will export the data to a JSON file.

## Motivation

For a while I was deciding on moving from Spotify to either YouTube Music or my own music streaming application, [SounDroid](https://github.com/zS1L3NT/dart-flutter-soundroid). For now the YouTube API has lots of restrictions on the number of requests you can make, so I have no way to migrate my Spotify playlist to YouTube on my own even if I wanted to. Since SounDroid stores it's playlist information on Firebase it is very possible to move all the songs to it.

## Features

-   Choose which playlists to convert to YouTube videos
-   Search for each song in the playlist on YouTube
    -   The first song that receives a similarity of about 80% will be chosen
    -   If it cannot find a similar song, the CLI tool will ask you to choose the best result
        -   It will fetch results from YouTube Music then YouTube

## Usage

Copy the `.env.example` file to `.env` then fill in the json file with the correct project credentials.

```
$ npm i
$ npm run dev
```

## Built with

-   TypeScript
    -   [![@types/node](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-spotify-to-youtube/dev/@types/node?style=flat-square)](https://npmjs.com/package/@types/node)
    -   [![@types/prompts](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-spotify-to-youtube/dev/@types/prompts?style=flat-square)](https://npmjs.com/package/@types/prompts)
    -   [![@types/spotify-web-api-node](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-spotify-to-youtube/dev/@types/spotify-web-api-node?style=flat-square)](https://npmjs.com/package/@types/spotify-web-api-node)
    -   [![@types/string-similarity](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-spotify-to-youtube/dev/@types/string-similarity?style=flat-square)](https://npmjs.com/package/@types/string-similarity)
    -   [![ts-node](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-spotify-to-youtube/dev/ts-node?style=flat-square)](https://npmjs.com/package/ts-node)
    -   [![typescript](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-spotify-to-youtube/dev/typescript?style=flat-square)](https://npmjs.com/package/typescript)
-   CLI
    -   [![ora](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-spotify-to-youtube/ora?style=flat-square)](https://npmjs.com/package/ora)
    -   [![prompts](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-spotify-to-youtube/prompts?style=flat-square)](https://npmjs.com/package/prompts)
-   APIs
    -   [![dotenv](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-spotify-to-youtube/dotenv?style=flat-square)](https://npmjs.com/package/dotenv)
    -   [![spotify-web-api-node](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-spotify-to-youtube/spotify-web-api-node?style=flat-square)](https://npmjs.com/package/spotify-web-api-node)
    -   [![string-similarity](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-spotify-to-youtube/string-similarity?style=flat-square)](https://npmjs.com/package/string-similarity)
    -   [![ytmusic-api](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-spotify-to-youtube/ytmusic-api?style=flat-square)](https://npmjs.com/package/ytmusic-api)
