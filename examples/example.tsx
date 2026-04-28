/**
 * Example TSX / React component with TypeScript
 * Showcasing Flatwhite theme highlighting for TSX/React syntax
 */

import React, { ReactNode, useState, useCallback } from "react";

/**
 * Props for the Button component
 */
interface ButtonProps {
  onClick: () => void;
  children: ReactNode;
  variant?: "primary" | "secondary" | "success" | "danger";
  disabled?: boolean;
  size?: "small" | "medium" | "large";
}

/**
 * Reusable button component
 */
const Button: React.FC<ButtonProps> = ({
  onClick,
  children,
  variant = "primary",
  disabled = false,
  size = "medium",
}) => {
  const classNames = `btn btn-${variant} btn-${size} ${
    disabled ? "disabled" : ""
  }`;

  return (
    <button
      className={classNames}
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      {children}
    </button>
  );
};

/**
 * Props for the Form component
 */
interface FormData {
  username: string;
  email: string;
  password: string;
  agreeToTerms: boolean;
}

/**
 * Props for the Form component
 */
interface FormProps {
  onSubmit: (data: FormData) => void;
}

/**
 * Form component with validation
 */
const Form: React.FC<FormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.username) {
      newErrors.username = "Username is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password || formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    const { name, value, type } = e.target;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
      setFormData({
        username: "",
        email: "",
        password: "",
        agreeToTerms: false,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <fieldset>
        <legend>User Registration</legend>

        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter your username"
            aria-invalid={!!errors.username}
          />
          {errors.username && <span className="error">{errors.username}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            aria-invalid={!!errors.email}
          />
          {errors.email && <span className="error">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            aria-invalid={!!errors.password}
          />
          {errors.password && <span className="error">{errors.password}</span>}
        </div>

        <div className="form-group checkbox">
          <input
            id="terms"
            type="checkbox"
            name="agreeToTerms"
            checked={formData.agreeToTerms}
            onChange={handleChange}
            aria-invalid={!!errors.agreeToTerms}
          />
          <label htmlFor="terms">I agree to the terms and conditions</label>
          {errors.agreeToTerms && (
            <span className="error">{errors.agreeToTerms}</span>
          )}
        </div>

        <div className="form-actions">
          <Button onClick={() => {}} variant="primary">
            Submit
          </Button>
          <Button onClick={() => {}} variant="secondary">
            Cancel
          </Button>
        </div>
      </fieldset>
    </form>
  );
};

/**
 * Generic List component
 */
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  keyExtractor: (item: T, index: number) => string | number;
}

/**
 * Reusable list component
 */
function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul className="list">
      {items.map((item, index) => (
        <li key={keyExtractor(item, index)}>{renderItem(item, index)}</li>
      ))}
    </ul>
  );
}

/**
 * Main App component
 */
const App: React.FC = () => {
  const [users, setUsers] = useState<FormData[]>([]);

  const handleFormSubmit = (data: FormData): void => {
    setUsers((prev) => [...prev, data]);
  };

  const deleteUser = (index: number): void => {
    setUsers((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Flatwhite Theme TSX Example</h1>
        <p>A TypeScript + React component showcase</p>
      </header>

      <main className="main-content">
        <section className="registration-section">
          <Form onSubmit={handleFormSubmit} />
        </section>

        <section className="users-section">
          <h2>Registered Users</h2>
          {users.length === 0 ? (
            <p className="empty-state">No users registered yet.</p>
          ) : (
            <List
              items={users}
              keyExtractor={(_, index) => index}
              renderItem={(user, index) => (
                <div className="user-item">
                  <div className="user-info">
                    <strong>{user.username}</strong>
                    <span>{user.email}</span>
                  </div>
                  <Button
                    onClick={() => deleteUser(index)}
                    variant="danger"
                    size="small"
                  >
                    Delete
                  </Button>
                </div>
              )}
            />
          )}
        </section>
      </main>

      <footer className="footer">
        <p>
          &copy; 2024 Flatwhite TSX Example. Built with React and TypeScript.
        </p>
      </footer>
    </div>
  );
};

export default App;
