import { Injectable } from '@nestjs/common';
import { JsonCompatible } from '@vendure/common/lib/shared-types';

import { ConfigService } from '../config/config.service';
import { Logger } from '../config/index';
import { CacheStrategy, SetCacheKeyOptions } from '../config/system/cache-strategy';

/**
 * @description
 * The CacheService is used to cache data in order to optimize performance.
 *
 * Internally it makes use of the configured {@link CacheStrategy} to persist
 * the cache into a key-value store.
 *
 * @since 3.1.0
 */
@Injectable()
export class CacheService {
    protected cacheStrategy: CacheStrategy;
    constructor(private configService: ConfigService) {
        this.cacheStrategy = this.configService.systemOptions.cacheStrategy;
    }

    /**
     * @description
     * Gets an item from the cache, or returns undefined if the key is not found, or the
     * item has expired.
     */
    async get<T extends JsonCompatible<T>>(key: string): Promise<T | undefined> {
        try {
            const result = await this.cacheStrategy.get(key);
            if (result) {
                Logger.debug(`CacheService hit for key [${key}]`);
            }
            return result as T;
        } catch (e: any) {
            Logger.error(`Could not get key [${key}] from CacheService`, undefined, e.stack);
        }
    }

    /**
     * @description
     * Sets a key-value pair in the cache. The value must be serializable, so cannot contain
     * things like functions, circular data structures, class instances etc.
     *
     * Optionally a "time to live" (ttl) can be specified, which means that the key will
     * be considered stale after that many milliseconds.
     */
    async set<T extends JsonCompatible<T>>(
        key: string,
        value: T,
        options?: SetCacheKeyOptions,
    ): Promise<void> {
        try {
            await this.cacheStrategy.set(key, value, options);
            Logger.debug(`Set key [${key}] in CacheService`);
        } catch (e: any) {
            Logger.error(`Could not set key [${key}] in CacheService`, undefined, e.stack);
        }
    }

    /**
     * @description
     * Deletes an item from the cache.
     */
    async delete(key: string): Promise<void> {
        try {
            await this.cacheStrategy.delete(key);
            Logger.debug(`Deleted key [${key}] from CacheService`);
        } catch (e: any) {
            Logger.error(`Could not delete key [${key}] from CacheService`, undefined, e.stack);
        }
    }
}
