/* Flatwhite theme preview — C */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>

#define ARENA_DEFAULT_CAP 4096
#define ALIGN(n, a) (((n) + (a) - 1) & ~((a) - 1))

typedef struct {
    char  *base;
    size_t cap;
    size_t used;
} Arena;

Arena *arena_new(size_t cap) {
    Arena *a = malloc(sizeof(Arena));
    if (!a) return NULL;
    a->base = malloc(cap);
    if (!a->base) { free(a); return NULL; }
    a->cap  = cap;
    a->used = 0;
    return a;
}

void *arena_alloc(Arena *a, size_t size) {
    size_t aligned = ALIGN(size, sizeof(void *));
    if (a->used + aligned > a->cap) return NULL;
    void *ptr = a->base + a->used;
    a->used += aligned;
    return ptr;
}

void arena_reset(Arena *a) {
    a->used = 0;
}

void arena_free(Arena *a) {
    free(a->base);
    free(a);
}

/* --- simple string interning --- */

typedef struct Entry {
    const char  *key;
    struct Entry *next;
} Entry;

typedef struct {
    Entry  **buckets;
    size_t   count;
    Arena   *arena;
} Intern;

static unsigned hash_str(const char *s) {
    unsigned h = 2166136261u;
    while (*s) { h ^= (unsigned char)*s++; h *= 16777619u; }
    return h;
}

Intern *intern_new(size_t count, Arena *arena) {
    Intern *t = arena_alloc(arena, sizeof(Intern));
    t->buckets = arena_alloc(arena, count * sizeof(Entry *));
    memset(t->buckets, 0, count * sizeof(Entry *));
    t->count = count;
    t->arena = arena;
    return t;
}

const char *intern_get(Intern *t, const char *s) {
    unsigned slot = hash_str(s) % t->count;
    for (Entry *e = t->buckets[slot]; e; e = e->next) {
        if (strcmp(e->key, s) == 0) return e->key;
    }
    size_t len = strlen(s) + 1;
    char *copy = arena_alloc(t->arena, len);
    memcpy(copy, s, len);
    Entry *entry = arena_alloc(t->arena, sizeof(Entry));
    entry->key  = copy;
    entry->next = t->buckets[slot];
    t->buckets[slot] = entry;
    return copy;
}

int main(void) {
    Arena *arena = arena_new(ARENA_DEFAULT_CAP);
    if (!arena) { fputs("out of memory\n", stderr); return 1; }

    Intern *table = intern_new(64, arena);

    const char *words[] = { "hello", "world", "hello", "foo", "world", NULL };
    for (int i = 0; words[i]; i++) {
        const char *interned = intern_get(table, words[i]);
        printf("intern(%s) = %p\n", words[i], (void *)interned);
    }

    printf("arena used: %zu / %zu bytes\n", arena->used, arena->cap);

    arena_free(arena);
    return 0;
}
