#!/usr/bin/env bash
# Flatwhite theme preview — Shell

set -euo pipefail

readonly MAX_RETRIES=3
GREETING='Hello, world!'

log() {
    local level="$1"
    shift
    echo "[$level] $*"
}

deploy() {
    local env="${1:-staging}"
    local attempt=0

    if [[ "$env" != "staging" && "$env" != "production" ]]; then
        log "ERROR" "unknown environment: $env"
        return 1
    fi

    while (( attempt < MAX_RETRIES )); do
        attempt=$((attempt + 1))
        log "INFO" "deploying to $env (attempt $attempt)"

        if ./scripts/push.sh "$env"; then
            log "INFO" "$GREETING deployment succeeded"
            return 0
        fi
    done

    log "ERROR" "deployment failed after $MAX_RETRIES attempts"
    return 1
}

cat <<EOF
Deployment summary for host $(hostname):
  user: $USER
  home: $HOME
EOF

case "${1:-}" in
    staging|production)
        deploy "$1"
        ;;
    *)
        echo "usage: $0 {staging|production}"
        exit 1
        ;;
esac
