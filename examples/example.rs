// Flatwhite theme preview — Rust

use std::collections::HashMap;
use std::fmt;

#[derive(Debug, Clone, PartialEq)]
pub enum Token {
    Number(f64),
    Ident(String),
    Plus,
    Minus,
    Star,
    Slash,
    LParen,
    RParen,
}

#[derive(Debug)]
pub struct LexError {
    pub pos: usize,
    pub ch: char,
}

impl fmt::Display for LexError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "unexpected character {:?} at position {}", self.ch, self.pos)
    }
}

pub fn lex(input: &str) -> Result<Vec<Token>, LexError> {
    let mut tokens = Vec::new();
    let mut chars = input.char_indices().peekable();

    while let Some((pos, ch)) = chars.next() {
        match ch {
            ' ' | '\t' | '\n' => continue,
            '+' => tokens.push(Token::Plus),
            '-' => tokens.push(Token::Minus),
            '*' => tokens.push(Token::Star),
            '/' => tokens.push(Token::Slash),
            '(' => tokens.push(Token::LParen),
            ')' => tokens.push(Token::RParen),
            '0'..='9' | '.' => {
                let mut num = String::from(ch);
                while let Some(&(_, c)) = chars.peek() {
                    if c.is_ascii_digit() || c == '.' {
                        num.push(c);
                        chars.next();
                    } else {
                        break;
                    }
                }
                let value: f64 = num.parse().map_err(|_| LexError { pos, ch })?;
                tokens.push(Token::Number(value));
            }
            'a'..='z' | 'A'..='Z' | '_' => {
                let mut ident = String::from(ch);
                while let Some(&(_, c)) = chars.peek() {
                    if c.is_alphanumeric() || c == '_' {
                        ident.push(c);
                        chars.next();
                    } else {
                        break;
                    }
                }
                tokens.push(Token::Ident(ident));
            }
            _ => return Err(LexError { pos, ch }),
        }
    }
    Ok(tokens)
}

pub struct Env {
    vars: HashMap<String, f64>,
}

impl Env {
    pub fn new() -> Self {
        Self { vars: HashMap::new() }
    }

    pub fn set(&mut self, name: impl Into<String>, val: f64) {
        self.vars.insert(name.into(), val);
    }

    pub fn get(&self, name: &str) -> Option<f64> {
        self.vars.get(name).copied()
    }
}

impl Default for Env {
    fn default() -> Self {
        Self::new()
    }
}

fn main() {
    let mut env = Env::new();
    env.set("x", 3.0);
    env.set("y", 4.0);

    let expressions = [
        "1 + 2 * 3",
        "x + y",
        "(10 - 2) / 4",
    ];

    for expr in &expressions {
        match lex(expr) {
            Ok(tokens) => println!("{:?}", tokens),
            Err(e) => eprintln!("lex error: {}", e),
        }
    }
}
