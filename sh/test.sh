(
  printf "Checking Code Style... "
  standard > stdout.tmp 2> stderr.tmp && (
    echo "passed"
  ) || (
    echo "failed" >&2
    cat stderr.tmp >&2
    cat stdout.tmp
    exit 2
  )
) && (
  printf "Testing Program... "
  node test > stdout.tmp 2> stderr.tmp && (
    echo "passed"
  ) || (
    status=$?
    echo "failed" >&2
    cat stderr.tmp >&2
    cat stdout.tmp
    echo "Test terminated with status $status."
    exit $status
  )
)
