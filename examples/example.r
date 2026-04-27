# Flatwhite theme preview — R

library(stats)

# --- data generation ---

set.seed(42)

n_groups  <- 4L
n_per     <- 50L
group_ids <- rep(seq_len(n_groups), each = n_per)

group_means <- c(10.0, 12.5, 9.8, 11.2)
group_sds   <- c(1.5,  2.0,  1.2, 1.8)

values <- mapply(
  function(mu, sigma) rnorm(n_per, mean = mu, sd = sigma),
  group_means, group_sds
)

df <- data.frame(
  group = factor(rep(paste0("G", seq_len(n_groups)), each = n_per)),
  value = as.vector(values)
)

# --- descriptive statistics ---

summarise_group <- function(x) {
  c(
    n      = length(x),
    mean   = mean(x),
    sd     = sd(x),
    median = median(x),
    q1     = quantile(x, 0.25),
    q3     = quantile(x, 0.75)
  )
}

stats_by_group <- tapply(df$value, df$group, summarise_group)
summary_df     <- do.call(rbind, lapply(stats_by_group, as.data.frame.list))

cat("Group summary:\n")
print(round(summary_df, digits = 3L))

# --- one-way ANOVA ---

model <- aov(value ~ group, data = df)
anova_table <- summary(model)[[1]]

cat("\nANOVA table:\n")
print(anova_table)

p_value <- anova_table[["Pr(>F)"]][1]
if (!is.null(p_value) && p_value < 0.05) {
  cat("\nSignificant group differences detected (p =", round(p_value, 4L), ")\n")

  tukey <- TukeyHSD(model)
  sig_pairs <- tukey$group[tukey$group[, "p adj"] < 0.05, , drop = FALSE]
  if (nrow(sig_pairs) > 0L) {
    cat("Significant pairwise differences:\n")
    print(round(sig_pairs, 4L))
  }
} else {
  cat("No significant group differences (p =", round(p_value, 4L), ")\n")
}

# --- simple linear regression ---

df$x <- rnorm(nrow(df), mean = 5, sd = 1)
df$y <- 2.3 * df$x + rnorm(nrow(df), sd = 0.8)

lm_fit    <- lm(y ~ x, data = df)
lm_summ   <- summary(lm_fit)

cat("\nLinear regression (y ~ x):\n")
cat("  Intercept:", round(coef(lm_fit)[1], 4L), "\n")
cat("  Slope:    ", round(coef(lm_fit)[2], 4L), "\n")
cat("  R²:       ", round(lm_summ$r.squared, 4L), "\n")
