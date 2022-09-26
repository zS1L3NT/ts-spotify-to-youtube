declare module NodeJS {
	interface ProcessEnv {
		readonly SPOTIFY__CLIENT_ID: string
		readonly SPOTIFY__CLIENT_SECRET: string
		readonly SPOTIFY__REFRESH_TOKEN: string
	}
}
