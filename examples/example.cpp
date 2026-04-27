// Flatwhite theme preview — C++

#include <algorithm>
#include <cstddef>
#include <functional>
#include <iostream>
#include <memory>
#include <optional>
#include <string>
#include <vector>

template <typename T>
class CircularBuffer {
public:
    explicit CircularBuffer(std::size_t capacity)
        : buf_(capacity), head_(0), tail_(0), size_(0), cap_(capacity) {}

    bool push(T value) {
        if (size_ == cap_) return false;
        buf_[tail_] = std::move(value);
        tail_ = (tail_ + 1) % cap_;
        ++size_;
        return true;
    }

    std::optional<T> pop() {
        if (size_ == 0) return std::nullopt;
        T val = std::move(buf_[head_]);
        head_ = (head_ + 1) % cap_;
        --size_;
        return val;
    }

    [[nodiscard]] std::size_t size()     const noexcept { return size_; }
    [[nodiscard]] std::size_t capacity() const noexcept { return cap_; }
    [[nodiscard]] bool        empty()    const noexcept { return size_ == 0; }
    [[nodiscard]] bool        full()     const noexcept { return size_ == cap_; }

private:
    std::vector<T> buf_;
    std::size_t    head_, tail_, size_, cap_;
};

template <typename T>
class Pipeline {
public:
    using Stage = std::function<T(T)>;

    Pipeline& then(Stage stage) {
        stages_.push_back(std::move(stage));
        return *this;
    }

    T run(T input) const {
        for (const auto& stage : stages_)
            input = stage(std::move(input));
        return input;
    }

private:
    std::vector<Stage> stages_;
};

struct Record {
    int         id;
    std::string name;
    double      score;
};

int main() {
    CircularBuffer<int> ring(8);

    for (int i = 1; i <= 10; ++i) {
        if (!ring.push(i))
            std::cout << "buffer full, dropped " << i << "\n";
    }

    std::cout << "ring size: " << ring.size() << "/" << ring.capacity() << "\n";

    while (!ring.empty()) {
        if (auto val = ring.pop())
            std::cout << "popped: " << *val << "\n";
    }

    auto pipeline = Pipeline<std::string>{}
        .then([](std::string s) { return s + "!"; })
        .then([](std::string s) { std::ranges::transform(s, s.begin(), ::toupper); return s; })
        .then([](std::string s) { return "[" + s + "]"; });

    std::cout << pipeline.run("hello world") << "\n";

    std::vector<Record> records = {
        {3, "Charlie", 88.5},
        {1, "Alice",   95.0},
        {2, "Bob",     72.3},
    };

    std::ranges::sort(records, {}, &Record::score);
    for (const auto& r : records)
        std::cout << r.id << " " << r.name << " " << r.score << "\n";

    return 0;
}
