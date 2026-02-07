set -euo pipefail
ts=$(date +%s)
tar -czf "/root/brain-shell-3805_${ts}.tgz" -C /opt/hx2 brain-shell-3805
ls -lh "/root/brain-shell-3805_${ts}.tgz"
