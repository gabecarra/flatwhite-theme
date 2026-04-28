/**
 * Example JSX / React component
 * Showcasing Flatwhite theme highlighting for JSX/React syntax
 */

import React, { useState, useEffect } from "react";
import "./styles.css";

// Functional component with hooks
export function Button({ onClick, children, variant = "primary" }) {
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    console.log("Button component mounted");
    return () => console.log("Button component unmounted");
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const buttonClass = `btn btn-${variant} ${isHovered ? "hovered" : ""}`;

  return (
    <button
      className={buttonClass}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label="Button"
    >
      {children}
    </button>
  );
}

// Component with template literals
export function Card({ title, description, children }) {
  const cardId = `card-${Date.now()}`;
  const ariaLabel = `Card: ${title}`;

  return (
    <article id={cardId} aria-label={ariaLabel} className="card">
      <header className="card-header">
        <h2>{title}</h2>
      </header>
      {description && <p className="card-description">{description}</p>}
      <section className="card-content">{children}</section>
    </article>
  );
}

// Component with conditional rendering
export function Alert({ type = "info", message, onDismiss }) {
  const alertTypes = {
    success: { icon: "✓", color: "green" },
    error: { icon: "✕", color: "red" },
    warning: { icon: "⚠", color: "orange" },
    info: { icon: "ℹ", color: "blue" },
  };

  const { icon, color } = alertTypes[type] || alertTypes.info;

  return (
    <div className={`alert alert-${color}`} role="alert">
      <span className="alert-icon">{icon}</span>
      <span className="alert-message">{message}</span>
      {onDismiss && (
        <button
          className="alert-close"
          onClick={onDismiss}
          aria-label="Close alert"
        >
          ×
        </button>
      )}
    </div>
  );
}

// Component with event handling and state
export default function App() {
  const [count, setCount] = useState(0);
  const [items, setItems] = useState(["Item 1", "Item 2"]);

  const handleIncrement = () => setCount(count + 1);
  const handleReset = () => setCount(0);

  const addItem = () => {
    const newItem = `Item ${items.length + 1}`;
    setItems([...items, newItem]);
  };

  return (
    <div className="app">
      <header>
        <h1>Flatwhite Theme JSX Example</h1>
      </header>

      <main>
        <Card title="Counter App" description="Click the buttons to interact">
          <div className="counter">
            <p>
              Count: <strong>{count}</strong>
            </p>
            <div className="button-group">
              <Button onClick={handleIncrement} variant="primary">
                Increment
              </Button>
              <Button onClick={handleReset} variant="secondary">
                Reset
              </Button>
            </div>
          </div>
        </Card>

        <Card title="Item List" description="Dynamically add items">
          <div className="item-list">
            <ul>
              {items.map((item, index) => (
                <li key={`item-${index}`}>{item}</li>
              ))}
            </ul>
            <Button onClick={addItem} variant="success">
              Add Item
            </Button>
          </div>
        </Card>

        <Alert type="success" message="JSX support is working perfectly!" />
      </main>

      <footer className="app-footer">
        <p>&copy; 2024 Flatwhite Theme Demo. All rights reserved.</p>
      </footer>
    </div>
  );
}
