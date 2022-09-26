import "dotenv/config"

import assert from "assert"
import { writeFileSync } from "fs"
import ora, { Ora } from "ora"
import prompts from "prompts"
import SpotifyWebApi from "spotify-web-api-node"
import { compareTwoStrings as similarity } from "string-similarity"
import YTMusicApi, { SongDetailed } from "ytmusic-api"

const spotify = new SpotifyWebApi({
	clientId: process.env.SPOTIFY__CLIENT_ID,
	clientSecret: process.env.SPOTIFY__CLIENT_SECRET,
	refreshToken: process.env.SPOTIFY__REFRESH_TOKEN
})

const ytmusic = new YTMusicApi()

const run = async () => {
	let loader!: Ora

	loader = ora("Initializing APIs").start()
	try {
		await ytmusic.initialize()
		const refreshResponse = (await spotify.refreshAccessToken()).body
		spotify.setAccessToken(refreshResponse.access_token)
		spotify.setRefreshToken(refreshResponse.refresh_token || process.env.SPOTIFY__REFRESH_TOKEN)
		loader.succeed()
	} catch (e) {
		loader.fail((<Error>e).message)
		return
	}

	let playlists!: SpotifyApi.PlaylistObjectSimplified[]
	loader = ora("Fetching Spotify Playlists").start()
	try {
		playlists = await recursivelyFetchPlaylists()
		loader.succeed()
	} catch (e) {
		loader.fail((<Error>e).message)
		return
	}

	playlists = <SpotifyApi.PlaylistObjectSimplified[]>(
		await prompts({
			type: "multiselect",
			name: "value",
			message: "Choose playlists to export",
			instructions: false,
			choices: playlists.map(item => ({
				title: item.name,
				description: item.description || "",
				value: item
			})),
			min: 1
		})
	).value

	loader = ora("Fetching Chosen Playlists Information").start()
	let playlistsFull!: {
		playlist: SpotifyApi.PlaylistObjectSimplified
		tracks: { spotify: SpotifyApi.TrackObjectFull | null; youtube: string | null }[]
	}[]
	try {
		playlistsFull = await Promise.all(
			playlists.map(async p => ({
				playlist: p,
				tracks: (
					await recursivelyFetchTracks(p.id)
				).map(st => ({ spotify: st, youtube: null }))
			}))
		)
		loader.succeed()
	} catch (e) {
		loader.fail((<Error>e).message)
		return
	}

	loader = ora("Fetching YouTube Tracks").start()
	try {
		for (const { playlist, tracks } of playlistsFull) {
			const text = `Fetching YouTube Tracks for ${playlist.name}`
			loader.text = text

			let num = 0
			const nomatches = <[number, SongDetailed[]][]>(
				await Promise.all(
					tracks.map(async (track, i) => {
						if (!track.spotify) {
							loader.text = `${text}: ${++num}/${tracks.length}`
							return
						}

						const songs = await ytmusic.searchSongs(
							`${track.spotify.name} - ${track.spotify.artists[0]?.name || ""}`
						)
						loader.text = `${text}: ${++num}/${tracks.length}`

						for (const song of songs) {
							if (
								(similarity(track.spotify.name, song.name) > 0.8 ||
									similarity(
										track.spotify.name,
										song.name.slice(0, song.name.length / 2)
									) > 0.8) &&
								song.artists.length > 0 &&
								track.spotify.artists.length > 0 &&
								song.artists.some(ya =>
									track.spotify!.artists.some(
										sa => similarity(sa.name, ya.name) > 0.8
									)
								)
							) {
								track.youtube = song.videoId
								return
							}
						}

						return [i, songs]
					})
				)
			).filter(i => i !== undefined)

			loader.stop()
			for (const [i, songs] of nomatches) {
				const track = tracks[i]!
				assert(track.spotify)

				let videoId: string | null = null
				videoId = (
					await prompts({
						type: "select",
						name: "value",
						message: `Which of these is the correct song for: ${track.spotify.name} - ${
							track.spotify.artists[0]?.name || "?"
						}`,
						instructions: false,
						choices: [
							...songs.map(song => ({
								title: `${song.name} - ${song.artists[0]?.name || "?"}`,
								description: `${
									Math.round(similarity(song.name, track.spotify!.name) * 10000) /
									100
								}%`,
								value: song.videoId
							})),
							{
								title: "NONE",
								description: "Search using YouTube instead",
								value: null
							}
						]
					})
				).value

				if (!videoId) {
					const youtubeVideos = await ytmusic.searchVideos(
						`${track.spotify.name} - ${track.spotify.artists[0]?.name}`
					)
					videoId = (
						await prompts({
							type: "select",
							name: "value",
							message: `Which of these is the correct video for: ${
								track.spotify.name
							} - ${track.spotify.artists[0]?.name || "?"}`,
							instructions: false,
							choices: [
								...youtubeVideos.map(yv => ({
									title: yv.name,
									description: `${
										Math.round(
											similarity(
												yv.name,
												`${track.spotify!.name} - ${
													track.spotify!.artists[0]?.name || ""
												}`
											) * 10000
										) / 100
									}%`,
									value: yv.videoId
								})),
								{
									title: "NONE",
									description: "Skip this track",
									value: null
								}
							]
						})
					).value
				}

				track.youtube = videoId
			}
		}
		loader.succeed()
	} catch (e) {
		loader.fail((<Error>e).message)
		return
	}

	writeFileSync(
		"data.json",
		JSON.stringify(
			playlistsFull.map(({ playlist, tracks }) => ({
				playlistName: playlist.name,
				tracks: tracks.reduce(
					(tracks, track) => ({ ...tracks, [track.spotify!.id]: track.youtube }),
					<Record<string, string | null>>{}
				)
			})),
			null,
			2
		)
	)
}

const recursivelyFetchPlaylists = async (): Promise<SpotifyApi.PlaylistObjectSimplified[]> => {
	let offset = 0
	const playlists = <SpotifyApi.PlaylistObjectSimplified[]>[]

	while (true) {
		const {
			body: { items }
		} = await spotify.getUserPlaylists({ offset, limit: 50 })

		playlists.push(...items)
		if (items.length === 50) {
			offset += 50
		} else {
			break
		}
	}

	return playlists
}

const recursivelyFetchTracks = async (
	playlistId: string
): Promise<(SpotifyApi.TrackObjectFull | null)[]> => {
	let offset = 0
	const tracks = <(SpotifyApi.TrackObjectFull | null)[]>[]

	while (true) {
		const {
			body: { items }
		} = await spotify.getPlaylistTracks(playlistId, { offset, limit: 50 })

		tracks.push(...items.map(i => i.track))
		if (items.length === 50) {
			offset += 50
		} else {
			break
		}
	}

	return tracks
}

run()
