/** global cache object to store memoization caches*/
const memoizationCaches: Record<string, Map<string, any>> = {};
/** global boolean flag to control memoization */
let __memoizationEnabled = true;
const MAX_CACHE_SIZE = 10;
// h * m * s * ms -> n hours
const CACHE_EXPIRATION_TIME = 1 * 60 * 1 * 1000; // 5 minutes
/**
 * Memoization decorator.
 * @param target The target class or object containing the method.
 * @param propertyKey The name of the method to be memoized.
 * @param descriptor The property descriptor of the method.
 * @returns The modified property descriptor with memoization.
 */
type Memo = <T>(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) => TypedPropertyDescriptor<T>;
/** A function that can be used as a decorator to apply the memoization.*/
type MemoizedFnc<T, R> = (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<(this: T, ...args: any[]) => R>) => TypedPropertyDescriptor<(this: T, ...args: any[]) => R>;

/**
 * Memoization decorator.
 *
 * Memoization is a technique for caching the results of expensive function calls
 * based on their input arguments. This decorator can be applied to instance methods
 * to cache and reuse their results for the same input arguments, improving performance
 * by avoiding redundant computations.
 *
 * - This decorator  memoizes a method or accessor result based on its input arguments or watched properties.
 *
 * @template T The type of the instance that owns the method.
 * @template R The return type of the method.
 *
 * @param {...string[]} watchProperties The properties to watch for changes.
 * @returns {Memo} A decorator that can be applied to a method or accessor.
 *
 * @example
 * ```
 * class MyComponent {
 *   @memo()
 *   calculateExpensiveResult(arg1: number, arg2: number): number {
 *     // Expensive calculation here
 *     return // result
 *   }
 * }
 * ```
 *
 * @see the links below for more information on memoization and TypeScript decorators:
 * - https://angular.io/guide/change-detection-slow-computations
 * - https://en.wikipedia.org/wiki/Memoization
 * - https://www.typescriptlang.org/docs/handbook/decorators.html
 * - https://www.typescriptlang.org/docs/handbook/decorators.html#method-decorators
 * - https://www.typescriptlang.org/docs/handbook/decorators.html#property-descriptors
 * - https://www.typescriptlang.org/docs/handbook/decorators.html#accessor-decorators
 * - https://www.typescriptlang.org/docs/handbook/decorators.html#parameter-decorators
 * - https://www.typescriptlang.org/docs/handbook/decorators.html#class-decorators
 *
 */
//  When @memo() is applied to showPublishButton(), TypeScript internally translates it to:
//  MyClass.prototype.showPublishButton = memo(MyClass.prototype, 'showPublishButton', Object.getOwnPropertyDescriptor(MyClass.prototype, 'showPublishButton'));
function memo<T, R>(): Memo;
function memo<T, R>(...watchProperties: string[]): Memo;
function memo<T, R>(...watchProperties: string[]) {
    if (!__memoizationEnabled) {
        return noMemo;
    }
    if (watchProperties.length > 0) {
        return memoDoesChange<T, R>(watchProperties);
    }
    return memoDoesNotChange;
}

/** A helper function for the `memo` decorator that uses the original method or accessor without memoization. */
function noMemo<T, R>(_target: any, _propertyKey: string, descriptor: TypedPropertyDescriptor<(this: T, ...args: any[]) => R>): TypedPropertyDescriptor<(this: T, ...args: any[]) => R> {
    const originalMethod = descriptor.value;
    return originalMethod!.bind(this);
}

/**
 * A helper function for the `memo` decorator that handles memoization when no specific properties are being watched for changes.
 * 
 * This function modifies the descriptor of the method or accessor to check the cache before invoking the method or accessor.
 * If the cache contains a result for the current input arguments, that result is returned.
 * Otherwise, the method or accessor is invoked, the result is cached, and the result is returned.
 * 
 * @returns {MemoizedFnc} A function that can be used as a decorator to apply the memoization.
 */
function memoDoesNotChange<T, R>(
    _target: any,
    _propertyKey: string,
    descriptor: TypedPropertyDescriptor<(this: T, ...args: any[]) => R>
): TypedPropertyDescriptor<(this: T, ...args: any[]) => R> {
    const originalMethod = descriptor.value;
    const instanceKey = _target.constructor.name;
    const cache = memoizationCaches[instanceKey] || (memoizationCaches[instanceKey] = new Map<string, any>());

    //print();

    /**
     * This code defines a wrapper function for a method that caches its results based on the input arguments. 
     * It checks if the result for the given arguments exists in the cache and returns it; 
     * otherwise, it calls the original method, caches its result, and returns it.
     * @param this 
     * @param args 
     * @returns 
     */
    descriptor.value = function (this: T, ...args: any[]): R {
        const cacheKey = JSON.stringify(args.map(prop => this[prop]), (_, value) =>
            typeof value === 'bigint' ? value.toString() + 'n' : value
        );

        if (cache.has(cacheKey)) {
            return cache.get(cacheKey)!;
        }

        const result = originalMethod!.apply(this, args);
        cache.set(cacheKey, result);
        return result;
    };

    return descriptor;

    function print() {
        console.log(`memoizing key ${ instanceKey }`);
        console.log(`memoizing key ${ _propertyKey }`);
        console.log(`memoizing original method${ originalMethod }`);
        console.log(`memoizing descriptor ${ descriptor }`);
        console.log(`memoizing cache value ${ cache }`);
    }
}

/**
 * A helper function for the `memo` decorator that handles memoization when specific properties are being watched for changes.
 * 
 * This function creates a new private property for each watched property and redefines the watched property with a getter and setter.
 * The getter simply returns the value of the private property.
 * The setter updates the value of the private property and invalidates the cache for the method or accessor.
 * 
 * The function also modifies the descriptor of the method or accessor to check the cache before invoking the method or accessor.
 * If the cache contains a result for the current values of the watched properties, that result is returned.
 * Otherwise, the method or accessor is invoked, the result is cached, and the result is returned.
 * 
 * @param {string[]} watchProperties The properties to watch for changes.
 * @returns {MemoizedFnc} A function that can be used as a decorator to apply the memoization.
 */
function memoDoesChange<T, R>(watchProperties: string[]): MemoizedFnc<T, R> {
    return function (
        _target: any,
        _propertyKey: string,
        descriptor: TypedPropertyDescriptor<(this: T, ...args: any[]) => R>
    ): TypedPropertyDescriptor<(this: T, ...args: any[]) => R> {
        const originalMethod = descriptor.value;
        const instanceKey = _target.constructor.name;
        const cache = memoizationCaches[instanceKey] || (memoizationCaches[instanceKey] = new Map<string, { result: R, timestamp: number }>());

        watchProperties.forEach(prop => {
            if (!_target.hasOwnProperty(prop)) {
                // console.debug(`Property ${ prop } does not exist on target object`);
                return;
            }

            const privateProp = `_${ prop }`;
            _target[privateProp] = _target[prop];

            Object.defineProperty(_target, prop, {
                get: function () {
                    return this[privateProp];
                },
                set: function (value) {
                    this[privateProp] = value;
                    const cacheKey = JSON.stringify(watchProperties.map(prop => this[prop]), (_, value) =>
                        typeof value === 'bigint' ? value.toString() + 'n' : value
                    );
                    const result = originalMethod!.apply(this, []);
                    cache.set(cacheKey, { result, timestamp: Date.now() });
                    cleanCache(cache);
                }
            });
        });

        descriptor.value = function (this: T, ...args: any[]): R {
            const cacheKey = JSON.stringify(watchProperties.map(prop => this[prop]), (_, value) =>
                typeof value === 'bigint' ? value.toString() + 'n' : value
            );

            if (cache.has(cacheKey)) {
                const cachedEntry = cache.get(cacheKey)!;
                if (Date.now() - cachedEntry.timestamp < CACHE_EXPIRATION_TIME) {
                    return cachedEntry.result;
                } else {
                    cache.delete(cacheKey);
                }
            }

            const result = originalMethod!.apply(this, args);
            cache.set(cacheKey, { result, timestamp: Date.now() });
            cleanCache(cache);
            return result;
        };

        return descriptor;
    }
}

function cleanCache(cache: Map<string, { result: any, timestamp: number }>) {
    if (cache.size > MAX_CACHE_SIZE) {
        const oldestEntry = Array.from(cache.entries()).reduce((prev, curr) => {
            return prev[1].timestamp < curr[1].timestamp ? prev : curr;
        });
        cache.delete(oldestEntry[0]);
    }
}

/**
 * Clears all globally stored memoization caches. 
 * - It's beneficial when the application state changes, rendering cached results obsolete. 
 * - While it aids in managing memory usage preventing memory overload, and avoiding stale data. 
 * - Called when ngDestroy is called. to invalidate all caches for the current component and it children.
 */
function clearAllMemoizationCaches() {
    for (const key in memoizationCaches) {
        if (memoizationCaches.hasOwnProperty(key)) {
            memoizationCaches[key].clear();
        }
    }
}

/**
 * Enable or disable memoization globally.
 * @param enable boolean flag to control memoization
 */
function toggleMemoization(enable: boolean): void {
    __memoizationEnabled = enable;
}

export { memo, toggleMemoization, clearAllMemoizationCaches, memoizationCaches }