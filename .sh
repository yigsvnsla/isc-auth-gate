#  NOTAS

podman build --no-cache --pull --build-arg BUILD_NODE_ENV=testing -f .containers/Containerfile.test -t auth-gate-app-test . \
&& \
podman run --rm --name auth-gate-test -e NODE_ENV=testing -p 3000:3000 auth-gate-app-test 

# -------------

podman build --pull --build-arg BUILD_NODE_ENV=test -f .containers/Containerfile.test -t auth-gate-app-test .


NODE_ENV=testing bun run ./database/scripts/check.ts
NODE_ENV=development bun run ./database/scripts/check.ts
