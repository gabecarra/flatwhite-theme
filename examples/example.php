<?php
/**
 * Flatwhite theme preview — PHP
 */

declare(strict_types=1);

namespace Flatwhite\Demo;

use InvalidArgumentException;
use RuntimeException;

interface Serializable
{
    public function serialize(): string;
    public static function deserialize(string $data): static;
}

abstract class Collection implements \Countable, \IteratorAggregate
{
    protected array $items = [];

    public function count(): int
    {
        return count($this->items);
    }

    public function isEmpty(): bool
    {
        return empty($this->items);
    }

    public function getIterator(): \ArrayIterator
    {
        return new \ArrayIterator($this->items);
    }

    abstract public function add(mixed $item): static;
}

final class TypedCollection extends Collection
{
    public function __construct(private readonly string $type) {}

    public function add(mixed $item): static
    {
        if (!($item instanceof $this->type)) {
            throw new InvalidArgumentException(
                sprintf('Expected %s, got %s', $this->type, get_debug_type($item))
            );
        }
        $clone = clone $this;
        $clone->items[] = $item;
        return $clone;
    }

    public function filter(callable $predicate): static
    {
        $clone = clone $this;
        $clone->items = array_values(array_filter($this->items, $predicate));
        return $clone;
    }

    public function map(callable $transform): array
    {
        return array_map($transform, $this->items);
    }
}

class EventDispatcher
{
    private array $listeners = [];

    public function on(string $event, callable $listener): void
    {
        $this->listeners[$event][] = $listener;
    }

    public function emit(string $event, mixed ...$args): void
    {
        foreach ($this->listeners[$event] ?? [] as $listener) {
            $listener(...$args);
        }
    }

    public function once(string $event, callable $listener): void
    {
        $wrapper = null;
        $wrapper = function () use ($event, $listener, &$wrapper) {
            $listener(...func_get_args());
            $this->listeners[$event] = array_filter(
                $this->listeners[$event],
                fn($l) => $l !== $wrapper
            );
        };
        $this->on($event, $wrapper);
    }
}

// --- demo ---

$dispatcher = new EventDispatcher();

$dispatcher->on('login', function (string $user): void {
    echo "User logged in: {$user}\n";
});

$dispatcher->once('shutdown', function (): void {
    echo "Shutdown signal received\n";
});

$dispatcher->emit('login', 'alice');
$dispatcher->emit('login', 'bob');
$dispatcher->emit('shutdown');
$dispatcher->emit('shutdown'); // listener already removed

class User
{
    public function __construct(
        public readonly int    $id,
        public readonly string $name,
        public readonly string $email,
    ) {}
}

$users = new TypedCollection(User::class);
$users = $users
    ->add(new User(1, 'Alice', 'alice@example.com'))
    ->add(new User(2, 'Bob',   'bob@example.com'))
    ->add(new User(3, 'Carol', 'carol@example.com'));

$bUsers = $users->filter(fn(User $u) => str_contains($u->name, 'o'));
$names  = $bUsers->map(fn(User $u) => $u->name);
echo implode(', ', $names) . "\n";
