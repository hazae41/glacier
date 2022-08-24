import { lastOf } from "../libs/arrays";
import { Core, Fetcher, Scroller } from "./core";

export class Scroll {
	constructor(readonly core: Core) { }

	/**
	 * 
	 * @param key Key
	 * @param scroller We don't care if it's not memoized
	 * @param fetcher We don't care if it's not memoized
	 * @param cooldown 
	 * @returns 
	 */
	async first<D = any, E = any>(
		key: string | undefined,
		scroller: Scroller<D>,
		fetcher: Fetcher<D>,
		cooldown?: number
	) {
		if (!key) return

		const current = this.core.get<D[], E>(key)
		if (current?.loading)
			return current
		if (this.core.cooldown(current, cooldown))
			return current
		const pages = current?.data ?? []
		const first = scroller(undefined)
		if (!first) return current

		try {
			this.core.mutate(key, { loading: true })
			const page = await fetcher(first)

			if (this.core.equals(page, pages[0]))
				return this.core.mutate<D[], E>(key, { data: pages })
			else
				return this.core.mutate<D[], E>(key, { data: [page] })
		} catch (error: any) {
			return this.core.mutate<D[], E>(key, { error })
		}
	}

	/**
	 * 
	 * @param key 
	 * @param scroller We don't care if it's not memoized
	 * @param fetcher We don't care if it's not memoized
	 * @param cooldown 
	 * @returns 
	 */
	async scroll<D = any, E = any>(
		key: string | undefined,
		scroller: Scroller<D>,
		fetcher: Fetcher<D>,
		cooldown?: number
	) {
		if (!key) return

		const current = this.core.get<D[], E>(key)
		if (current?.loading)
			return current
		if (this.core.cooldown(current, cooldown))
			return current
		const pages = current?.data ?? []
		const last = scroller(lastOf(pages))
		if (!last) return current

		try {
			this.core.mutate(key, { loading: true })
			const data = [...pages, await fetcher(last)]
			return this.core.mutate<D[], E>(key, { data })
		} catch (error: any) {
			return this.core.mutate<D[], E>(key, { error })
		}
	}
}