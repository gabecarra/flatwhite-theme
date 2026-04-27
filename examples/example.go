// Flatwhite theme preview — Go

package main

import (
	"context"
	"errors"
	"fmt"
	"sync"
	"time"
)

type Job struct {
	ID      int
	Payload string
}

type Result struct {
	JobID  int
	Output string
	Err    error
}

type WorkerPool struct {
	workers int
	jobs    chan Job
	results chan Result
	wg      sync.WaitGroup
}

func NewWorkerPool(workers int) *WorkerPool {
	return &WorkerPool{
		workers: workers,
		jobs:    make(chan Job, workers*2),
		results: make(chan Result, workers*2),
	}
}

func (p *WorkerPool) Start(ctx context.Context, process func(Job) (string, error)) {
	for i := 0; i < p.workers; i++ {
		p.wg.Add(1)
		go func() {
			defer p.wg.Done()
			for {
				select {
				case job, ok := <-p.jobs:
					if !ok {
						return
					}
					out, err := process(job)
					p.results <- Result{JobID: job.ID, Output: out, Err: err}
				case <-ctx.Done():
					return
				}
			}
		}()
	}
}

func (p *WorkerPool) Submit(job Job) {
	p.jobs <- job
}

func (p *WorkerPool) Close() {
	close(p.jobs)
	p.wg.Wait()
	close(p.results)
}

func (p *WorkerPool) Results() <-chan Result {
	return p.results
}

var ErrInvalidPayload = errors.New("invalid payload")

func processJob(job Job) (string, error) {
	if job.Payload == "" {
		return "", fmt.Errorf("job %d: %w", job.ID, ErrInvalidPayload)
	}
	time.Sleep(10 * time.Millisecond)
	return fmt.Sprintf("processed: %s", job.Payload), nil
}

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	pool := NewWorkerPool(4)
	pool.Start(ctx, processJob)

	payloads := []string{"alpha", "beta", "", "delta", "epsilon"}
	go func() {
		for i, p := range payloads {
			pool.Submit(Job{ID: i + 1, Payload: p})
		}
		pool.Close()
	}()

	for result := range pool.Results() {
		if result.Err != nil {
			fmt.Printf("error [job %d]: %v\n", result.JobID, result.Err)
		} else {
			fmt.Printf("ok    [job %d]: %s\n", result.JobID, result.Output)
		}
	}
}
