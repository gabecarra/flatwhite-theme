"""
Flatwhite theme preview — Python
"""

from dataclasses import dataclass, field
from typing import Optional
import math


GRAVITY = 9.81
MAX_RETRIES = 3


@dataclass
class Vector2D:
    x: float
    y: float

    def magnitude(self) -> float:
        return math.sqrt(self.x ** 2 + self.y ** 2)

    def normalize(self) -> "Vector2D":
        mag = self.magnitude()
        if mag == 0:
            return Vector2D(0.0, 0.0)
        return Vector2D(self.x / mag, self.y / mag)

    def __add__(self, other: "Vector2D") -> "Vector2D":
        return Vector2D(self.x + other.x, self.y + other.y)

    def __repr__(self) -> str:
        return f"Vector2D({self.x:.2f}, {self.y:.2f})"


@dataclass
class Particle:
    position: Vector2D
    velocity: Vector2D
    mass: float = 1.0
    alive: bool = True
    tags: list[str] = field(default_factory=list)

    def apply_force(self, force: Vector2D) -> None:
        acceleration = Vector2D(force.x / self.mass, force.y / self.mass)
        self.velocity = self.velocity + acceleration

    def step(self, dt: float = 0.016) -> None:
        if not self.alive:
            return
        gravity = Vector2D(0.0, -GRAVITY * self.mass)
        self.apply_force(gravity)
        self.position = Vector2D(
            self.position.x + self.velocity.x * dt,
            self.position.y + self.velocity.y * dt,
        )
        if self.position.y < 0:
            self.alive = False


def simulate(particles: list[Particle], steps: int = 100) -> dict[str, int]:
    stats = {"steps": 0, "alive": 0, "dead": 0}
    for _ in range(steps):
        stats["steps"] += 1
        for p in particles:
            p.step()
        alive = sum(1 for p in particles if p.alive)
        if alive == 0:
            break
    stats["alive"] = sum(1 for p in particles if p.alive)
    stats["dead"] = len(particles) - stats["alive"]
    return stats


def find_particle(
    particles: list[Particle],
    tag: str,
    *,
    only_alive: bool = True,
) -> Optional[Particle]:
    for p in particles:
        if only_alive and not p.alive:
            continue
        if tag in p.tags:
            return p
    return None


if __name__ == "__main__":
    particles = [
        Particle(Vector2D(0.0, 10.0), Vector2D(1.0, 5.0), mass=1.5, tags=["hero"]),
        Particle(Vector2D(2.0, 20.0), Vector2D(-0.5, 3.0), mass=0.8, tags=["enemy"]),
        Particle(Vector2D(5.0, 1.0), Vector2D(0.0, 0.1), mass=2.0),
    ]

    result = simulate(particles, steps=200)
    print(f"Simulation finished: {result}")

    hero = find_particle(particles, "hero", only_alive=False)
    if hero is not None:
        print(f"Hero final position: {hero.position}")
