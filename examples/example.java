/**
 * Flatwhite theme preview — Java
 */

package dev.flatwhite.demo;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.function.Function;

public sealed interface Result<T> permits Result.Ok, Result.Err {

    record Ok<T>(T value) implements Result<T> {
    }

    record Err<T>(String message, Throwable cause) implements Result<T> {
        Err(String message) {
            this(message, null);
        }
    }

    static <T> Result<T> ok(T value) {
        return new Ok<>(value);
    }

    static <T> Result<T> err(String msg) {
        return new Err<>(msg);
    }

    default boolean isOk() {
        return this instanceof Ok<T>;
    }

    default <U> Result<U> map(Function<T, U> fn) {
        return switch (this) {
            case Ok<T>(var v) -> Result.ok(fn.apply(v));
            case Err<T> e -> Result.err(e.message());
        };
    }

    default T orElse(T fallback) {
        return this instanceof Ok<T>(var v) ? v : fallback;
    }
}

public class Cache<K, V> {

    private final int capacity;
    private final Map<K, V> store;
    private final Map<K, Long> timestamps;

    private static final long DEFAULT_TTL_MS = 60_000L;

    public Cache(int capacity) {
        this.capacity = capacity;
        this.store = new HashMap<>(capacity);
        this.timestamps = new HashMap<>(capacity);
    }

    public synchronized void put(K key, V value) {
        if (store.size() >= capacity) {
            evictOldest();
        }
        store.put(key, value);
        timestamps.put(key, System.currentTimeMillis());
    }

    public synchronized Optional<V> get(K key) {
        Long ts = timestamps.get(key);
        if (ts == null)
            return Optional.empty();
        if (System.currentTimeMillis() - ts > DEFAULT_TTL_MS) {
            store.remove(key);
            timestamps.remove(key);
            return Optional.empty();
        }
        return Optional.ofNullable(store.get(key));
    }

    private void evictOldest() {
        K oldest = null;
        long min = Long.MAX_VALUE;
        for (var entry : timestamps.entrySet()) {
            if (entry.getValue() < min) {
                min = entry.getValue();
                oldest = entry.getKey();
            }
        }
        if (oldest != null) {
            store.remove(oldest);
            timestamps.remove(oldest);
        }
    }

    public int size() {
        return store.size();
    }
}

public class Pipeline<A, B> {

    private final List<Function<Object, Object>> stages = new ArrayList<>();

    @SuppressWarnings("unchecked")
    public <C> Pipeline<A, C> then(Function<B, C> fn) {
        stages.add((Function<Object, Object>) (Function<?, ?>) fn);
        return (Pipeline<A, C>) this;
    }

    @SuppressWarnings("unchecked")
    public B run(A input) {
        Object value = input;
        for (var stage : stages) {
            value = stage.apply(value);
        }
        return (B) value;
    }

    public CompletableFuture<B> runAsync(A input) {
        return CompletableFuture.supplyAsync(() -> run(input));
    }

    public static <T> Pipeline<T, T> identity() {
        return new Pipeline<>();
    }
}

class Demo {
    public static void main(String[] args) {
        var cache = new Cache<String, Integer>(128);
        cache.put("answer", 42);
        cache.put("zero", 0);

        cache.get("answer").ifPresent(v -> System.out.println("answer = " + v));

        var pipeline = Pipeline.<String>identity()
                .then(String::trim)
                .then(String::toUpperCase)
                .then(s -> s + "!");

        String output = pipeline.run("  hello, world  ");
        System.out.println(output); // HELLO, WORLD!

        Result<Integer> parsed = tryParse("123");
        Result<String> labelled = parsed.map(n -> "value: " + n);
        System.out.println(labelled.orElse("parse failed"));
    }

    static Result<Integer> tryParse(String s) {
        try {
            return Result.ok(Integer.parseInt(s));
        } catch (NumberFormatException e) {
            return Result.err("not a number: " + s);
        }
    }
}
